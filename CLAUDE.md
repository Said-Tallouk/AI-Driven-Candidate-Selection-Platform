# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Run the app
streamlit run app.py
```

There are no tests or linting configured for this project.

## Architecture Overview

**Skills Matcher Pro** is a Streamlit web app that screens CVs against a job offer using Word2Vec semantic similarity. Users upload a job offer PDF and multiple CV PDFs, set a similarity threshold, then trigger an analysis that scores each CV and recommends training courses for rejected candidates.

### Data flow

```
app.py
  → pages/upload.py        # Step 1: PDF uploads → (offer_text, cv_files)
  → pages/threshold.py     # Step 2: slider → similarity_threshold (float 0–1)
  → pages/analysis.py      # Step 3: scores each CV, renders results + charts + export
        → utils/processing.py   # extract_text_from_pdf(), calculate_similarity()
              → utils/model.py  # loads model.joblib (Word2Vec, cached)
        → components/charts.py  # bar_chart(), pie_chart(), histogram()
        → Courses.py            # ds_course list shown for rejected candidates
```

### Critical constraint: `st.set_page_config()` ordering

`st.set_page_config()` is called directly at the top of `app.py` **before all imports**, because Streamlit requires it to be the first call. Never import a module that triggers a Streamlit call before this line or the app will crash.

### Model loading

`utils/processing.py` calls `load_model()` at module import time (not inside a function). The model is a Word2Vec model stored as `model.joblib` at the project root and is cached via `@st.cache_resource`. If the file is missing the app will fail on startup.

### Similarity scoring

`calculate_similarity()` in `utils/processing.py` averages all in-vocabulary Word2Vec token vectors for the offer and for each CV, then returns the cosine similarity. Tokens not in the model's vocabulary are silently skipped; a score of `0.0` is returned if either document has no recognized tokens.

### Styling

All CSS lives in a single block in `config/styles.py` (`inject_styles()`). Class names are heavily abbreviated (`.tb` = topbar, `.mp` = main padding wrapper, `.sg` = stat grid, `.shd` = section header, etc.). `unsafe_allow_html=True` is used throughout for custom HTML rendering. `config/page_config.py` exists but is unused — its `configure_page()` function duplicates what `app.py` already does inline.

### Course recommendations

`Courses.py` exports `ds_course`, a flat list of `[name, url]` pairs. `pages/analysis.py` always shows the first 8 entries (`ds_course[:8]`) regardless of the rejected candidates' field — it is not profile-aware.
