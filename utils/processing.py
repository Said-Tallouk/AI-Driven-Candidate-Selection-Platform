"""
utils/processing.py — Extraction PDF & calcul de similarité sémantique
"""

import streamlit as st
import PyPDF2
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from nltk.tokenize import word_tokenize
from utils.model import load_model

model = load_model()


def extract_text_from_pdf(file) -> str:
    """Extrait le texte brut d'un fichier PDF uploadé."""
    try:
        text = ""
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        st.error(f"Erreur PDF : {str(e)}")
        return ""


def calculate_similarity(offer_text: str, cv_text: str) -> float:
    """
    Calcule la similarité cosinus entre l'offre et un CV
    en utilisant les vecteurs Word2Vec moyennés.
    Retourne un score entre 0 et 1.
    """
    try:
        offer_tokens = word_tokenize(offer_text.lower())
        cv_tokens    = word_tokenize(cv_text.lower())

        offer_vecs = np.array([
            model.wv.get_vector(t) for t in offer_tokens if t in model.wv.key_to_index
        ])
        cv_vecs = np.array([
            model.wv.get_vector(t) for t in cv_tokens if t in model.wv.key_to_index
        ])

        if not len(offer_vecs) or not len(cv_vecs):
            return 0.0

        score = cosine_similarity([offer_vecs.mean(0)], [cv_vecs.mean(0)])[0][0]
        return max(float(score), 0.0)

    except Exception as e:
        st.error(f"Erreur similarité : {str(e)}")
        return 0.0
