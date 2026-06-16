"""
utils/model.py — Chargement et mise en cache du modèle Word2Vec
"""

import streamlit as st
from joblib import load


@st.cache_resource
def load_model():
    """Charge le modèle Word2Vec depuis le fichier joblib."""
    return load('model.joblib')
