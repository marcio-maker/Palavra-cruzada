from flask import Flask, jsonify
import random
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Lista de palavras e dicas otimizadas
words_pt = [
    {"palavra": "AMOR", "dica": "Sentimento intenso de afeto"},
    {"palavra": "PAZ", "dica": "Ausência de conflito"},
    {"palavra": "SOL", "dica": "Estrela que ilumina o dia"},
    {"palavra": "LUA", "dica": "Satélite natural da Terra"},
    {"palavra": "MAR", "dica": "Grande extensão de água salgada"},
    {"palavra": "FLOR", "dica": "Parte colorida das plantas"},
    {"palavra": "CASA", "dica": "Lugar onde moramos"},
    {"palavra": "PÃO", "dica": "Alimento feito de farinha"},
    {"palavra": "LUZ", "dica": "Oposta à escuridão"},
    {"palavra": "RIO", "dica": "Corrente de água doce"},
    {"palavra": "VOVÔ", "dica": "Pai do pai ou da mãe"},
    {"palavra": "VOVÓ", "dica": "Mãe do pai ou da mãe"},
    {"palavra": "NETO", "dica": "Filho do filho ou da filha"},
    {"palavra": "JANELA", "dica": "Abertura na parede para entrar luz"},
    {"palavra": "PORTA", "dica": "Abertura para entrar e sair"},
    {"palavra": "CHÁ", "dica": "Bebida quente feita de ervas"},
    {"palavra": "CAFÉ", "dica": "Bebida estimulante matinal"},
    {"palavra": "LEITE", "dica": "Bebida branca nutritiva"},
    {"palavra": "BISCOITO", "dica": "Pequeno doce assado"},
    {"palavra": "BOLO", "dica": "Doce assado para festas"}
]

@app.route('/get_words')
def get_words():
    # Selecionar 10 palavras aleatórias simples (3-6 letras)
    simple_words = [w for w in words_pt if 3 <= len(w["palavra"]) <= 6]
    selected_words = random.sample(simple_words, min(10, len(simple_words)))
    return jsonify({"words": selected_words})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')