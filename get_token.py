import requests
import getpass
import os
from dotenv import load_dotenv

load_dotenv()
MOODLE_URL = os.getenv("MOODLE_URL")

if not MOODLE_URL:
    MOODLE_URL = input("Moodle URL (ex: https://moodle.isep.ipp.pt): ").strip()

if MOODLE_URL.endswith("/"):
    MOODLE_URL = MOODLE_URL[:-1]

LOGIN_ENDPOINT = "/login/token.php"

print(f"A conectar a {MOODLE_URL}...")
username = input("Username: ")
password = getpass.getpass("Password: ")

params = {
    'username': username,
    'password': password,
    'service': 'moodle_mobile_app'
}

try:
    response = requests.post(MOODLE_URL + LOGIN_ENDPOINT, data=params)
    data = response.json()

    if 'token' in data:
        print("\n" + "="*40)
        print(f"NOVO TOKEN: {data['token']}")
        print("="*40)
        print("Agora atualize o seu ficheiro .env com este token!")
    elif 'error' in data:
        print(f"\nErro Moodle: {data['error']}")
    else:
        print(f"\nResposta desconhecida: {data}")

except Exception as e:
    print(f"\nErro de conexão: {e}")
