import os
import requests
import re
import unicodedata
from dotenv import load_dotenv

# 1. Carregar Configuração
load_dotenv()
TOKEN = os.getenv("MOODLE_TOKEN")
DOMAIN = os.getenv("MOODLE_URL")
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "materials")
API_ENDPOINT = "/webservice/rest/server.php"

IGNORED_COURSES = [c.strip() for c in os.getenv("IGNORED_COURSES", "").split(",") if c.strip()]

if not TOKEN or not DOMAIN:
    print("Error: MOODLE_TOKEN or MOODLE_URL missing in .env")
    exit(1)

def sanitize(filename):
    """Remove caracteres ilegais para o sistema de ficheiros."""
    filename = re.sub(r'[\\/*?:"<>|]', "", filename)
    return filename.strip()

def clean_course_name(name):
    """
    Limpa prefixos e sufixos do ISEP.
    Ex: 'DEE - Math - 1º Semestre 20252026' -> 'Math'
    """
    # 1. Remove 'DEE - ' do início (case insensitive)
    name = re.sub(r'^DEE\s+-\s+', '', name, flags=re.IGNORECASE)
    
    # 2. Remove sufixo ' - 1º Semestre 20252026'
    name = re.sub(r'\s+-\s+\d+.*?\s+Semestre\s+[\d\/]+\s*$', '', name, flags=re.IGNORECASE)
    
    return name.strip()

def normalize_text(text):
    if not text: return ""
    return ''.join(c for c in unicodedata.normalize('NFD', text)
                  if unicodedata.category(c) != 'Mn').lower()

def categorize_file(filename, section_name):
    """
    Define a pasta de destino com as siglas oficiais (T, TP, PL).
    """
    
    # --- REGRA 0: TUDO O QUE NÃO É PDF VAI PARA ANEXOS ---
    if not filename.lower().endswith(".pdf"):
        return "Anexos"

    # Normaliza para a lógica seguinte
    name = normalize_text(filename)
    section = normalize_text(section_name)
    
    # --- 1. PL (Prático-Laboratorial) ---
    if (re.search(r'\b(pl|tl)\d+', name) or 'laborator' in name or 'laborator' in section):
        return "PL"

    # --- 2. Exemplos ---
    if ('resolv' in name or 'solucao' in name or 'solution' in name or 
        'exemplo' in name or 'sample' in name or 'gabarito' in name):
        return "Exemplos"

    # --- 3. TP (Teórico-Prático) - Mudado de 'P' para 'TP' ---
    if (re.search(r'\b(tp)\d+', name) or 'ficha' in name or 'exercicio' in name or 
        'problem' in name or 'enunciado' in name or 'guiao' in name or 
        'projeto' in name or 'project' in name or 'tpc' in name):
        return "TP"

    # --- 4. T (Teórico) ---
    if (re.search(r'\bt\d+', name) or 'teoric' in name or 'lecture' in name or 
        'slide' in name or 'acetato' in name or 'apresentaca' in name or 
        'aula' in name or 'docente' in name or 'sumario' in name or 'capitulo' in name):
        return "T"

    # --- 5. FALLBACK ---
    if 'teoric' in section: return "T"
    if 'pratic' in section: return "TP"
    
    return "Outros"

def call_api(function, params={}):
    payload = {'wstoken': TOKEN, 'wsfunction': function, 'moodlewsrestformat': 'json'}
    payload.update(params)
    try:
        return requests.post(DOMAIN + API_ENDPOINT, data=payload).json()
    except Exception as e:
        print(f"API Error: {e}")
        return {}

def download_file(url, path):
    if os.path.exists(path): return
    try:
        with requests.get(f"{url}&token={TOKEN}", stream=True) as r:
            r.raise_for_status()
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
        print(f"✓ [{os.path.basename(os.path.dirname(path))}] {os.path.basename(path)}")
    except Exception as e:
        print(f"x Failed: {os.path.basename(path)} - {e}")

def main():
    print("--- Starting Organized Moodle Sync (T/TP/PL) ---")
    
    user_info = call_api("core_webservice_get_site_info")
    if 'exception' in user_info:
        print(f"Error: {user_info['message']}")
        return

    userid = user_info['userid']
    courses = call_api("core_enrol_get_users_courses", {'userid': userid})
    
    for course in courses:
        course_name_raw = course['fullname']
        
        if any(ignored in course_name_raw for ignored in IGNORED_COURSES):
            continue

        course_name = clean_course_name(course_name_raw)
        course_name = sanitize(course_name)
        
        print(f"\nProcessing: {course_name}")
        
        contents = call_api("core_course_get_contents", {'courseid': course['id']})
        
        for section in contents:
            section_name = sanitize(section.get('name', 'General'))
            for module in section.get('modules', []):
                if 'contents' in module:
                    for content in module['contents']:
                        if content['type'] == 'file':
                            fname = sanitize(content['filename'])
                            category = categorize_file(fname, section_name)
                            
                            rel_path = os.path.join(course_name, category, fname)
                            download_file(content['fileurl'], os.path.join(OUTPUT_DIR, rel_path))

if __name__ == "__main__":
    main()
