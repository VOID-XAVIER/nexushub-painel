import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Procura o arquivo .env na raiz do projeto automaticamente
load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("❌ ERRO: SUPABASE_URL ou SUPABASE_KEY não foram encontradas no arquivo .env!")
else:
    print("✅ Chaves do .env carregadas com sucesso!")

# Cria a conexão com o Supabase
supabase: Client = create_client(url, key)