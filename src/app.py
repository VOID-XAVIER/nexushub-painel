from flask import Flask, request, jsonify
from flask_cors import CORS
# Import direto porque os dois arquivos estão na mesma pasta src
from database import supabase

app = Flask(__name__)
CORS(app)

@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "API Online", "banco": "Conectado"}), 200

@app.route("/vendedores", methods=["POST"])
def criar_vendedor():
    dados = request.json
    company_id = dados.get("company_id")
    user_id = dados.get("user_id")
    role = dados.get("role", "seller")

    if not company_id or not user_id:
        return jsonify({"erro": "company_id e user_id são obrigatórios!"}), 400

    try:
        resposta = supabase.table("company_users").insert({
            "company_id": company_id,
            "user_id": user_id,
            "role": role
        }).execute()
        return jsonify({"mensagem": "Vendedor cadastrado!", "dados": resposta.data}), 201
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@app.route("/vendedores", methods=["GET"])
def listar_vendedores():
    try:
        resposta = supabase.table("company_users").select("*").execute()
        return jsonify(resposta.data), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)