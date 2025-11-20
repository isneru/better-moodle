import os
import requests
import re
from dotenv import load_dotenv

# 1. Load Config
load_dotenv()
TOKEN = os.getenv("MOODLE_TOKEN")
DOMAIN = os.getenv("MOODLE_URL")
# We will download everything into a 'materials' folder inside your project
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "materials")
API_ENDPOINT = "/webservice/rest/server.php"

IGNORED_COURSES = [c.strip() for c in os.getenv("IGNORED_COURSES", "").split(",") if c.strip()]

if not TOKEN or not DOMAIN:
    print("Error: MOODLE_TOKEN or MOODLE_URL missing in .env")
    exit(1)

def sanitize(filename):
    return re.sub(r'[\\/*?:"<>|]', "", filename)

def call_api(function, params={}):
    payload = {
        'wstoken': TOKEN,
        'wsfunction': function,
        'moodlewsrestformat': 'json'
    }
    payload.update(params)
    try:
        return requests.post(DOMAIN + API_ENDPOINT, data=payload).json()
    except Exception as e:
        print(f"API Error: {e}")
        return {}

def download_file(url, path):
    if os.path.exists(path):
        return # Skip if exists
    
    # Moodle requires the token appended to the file URL
    download_url = f"{url}&token={TOKEN}"
    
    try:
        with requests.get(download_url, stream=True) as r:
            r.raise_for_status()
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
        print(f"✓ Downloaded: {os.path.basename(path)}")
    except Exception as e:
        print(f"x Failed: {os.path.basename(path)} - {e}")

def main():
    print("--- Starting Moodle Sync ---")
    
    # Get User ID & Courses
    user_info = call_api("core_webservice_get_site_info")
    if 'exception' in user_info:
        print(f"Error: {user_info['message']}")
        return

    userid = user_info['userid']
    courses = call_api("core_enrol_get_users_courses", {'userid': userid})
    
    for course in courses:
        course_name_raw = course['fullname']
        
        if any(ignored in course_name_raw for ignored in IGNORED_COURSES):
            print(f"Skipping ignored course: {course_name_raw}")
            continue

        course_name = sanitize(course_name_raw)
        print(f"\nProcessing: {course_name}")
        
        contents = call_api("core_course_get_contents", {'courseid': course['id']})
        
        for section in contents:
            section_name = sanitize(section.get('name', 'General'))
            if not section_name.strip(): continue
            
            for module in section.get('modules', []):
                if 'contents' in module:
                    for content in module['contents']:
                        if content['type'] == 'file':
                            fname = sanitize(content['filename'])
                            # Save to: materials / Course Name / Section Name / File.pdf
                            rel_path = os.path.join(course_name, section_name, fname)
                            full_path = os.path.join(OUTPUT_DIR, rel_path)
                            download_file(content['fileurl'], full_path)

if __name__ == "__main__":
    main()
