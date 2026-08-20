import os

from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from google import genai


# ==============================
# LOAD ENVIRONMENT
# ==============================

load_dotenv()

app = Flask(__name__)

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError("GEMINI_API_KEY is missing in .env file")

client = genai.Client(api_key=API_KEY)


# ==============================
# NUTRIBOT INSTRUCTIONS
# ==============================

SYSTEM_PROMPT = """
You are NutriBot, an AI chatbot ONLY for Food and Nutrition.

You MUST answer ONLY questions related to:

- Food
- Nutrition
- Nutrients
- Calories
- Protein
- Carbohydrates
- Fats
- Vitamins
- Minerals
- Fiber
- Healthy eating
- Balanced diet
- Food ingredients
- Food benefits
- Food comparison
- General meal and nutrition information

If the question is NOT related to food or nutrition,
do not answer it.

Reply:
"Sorry, I can only help with food and nutrition related questions. 🍎"

IMPORTANT:
- Give simple and clear answers.
- Nutrition values are approximate and can vary by serving size,
  preparation method and brand.
- Do not diagnose diseases.
- Do not prescribe medicines.
- Do not recommend dangerous diets.
- Do not provide extreme weight-loss advice.
- For medical concerns, suggest talking to a qualified healthcare professional.
"""


# ==============================
# HOME PAGE
# ==============================

@app.route("/")
def home():
    return render_template("index.html")


# ==============================
# CHAT API
# ==============================

@app.route("/chat", methods=["POST"])
def chat():

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "reply": "Please enter a food or nutrition question. 🍎"
            })

        user_message = data.get("message", "").strip()

        if not user_message:
            return jsonify({
                "success": False,
                "reply": "Please enter a question. 🍎"
            })


        # ==============================
        # SEND TO GEMINI
        # ==============================

        response = client.models.generate_content(

            model="gemini-3-flash-preview",

            contents=[
                SYSTEM_PROMPT,
                f"User question: {user_message}"
            ]
        )


        reply = response.text.strip()


        return jsonify({
            "success": True,
            "reply": reply
        })


    except Exception as e:

        print("ERROR:", e)

        return jsonify({
            "success": False,
            "reply": "Sorry, I couldn't process your question. Please try again."
        })


# ==============================
# RUN APPLICATION
# ==============================

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )