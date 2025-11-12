import sys, json
from joblib import load

sector, location, tech = sys.argv[1], sys.argv[2], sys.argv[3]

bundle = load("internship_recommender.pkl")
model = bundle["model"]
internships = bundle["internships"]

def recommend(sector, location, tech):
    query = f"{tech} {sector} {location} {location} {location}"
    vec = model.named_steps['tfidfvectorizer'].transform([query])
    distances, indices = model.named_steps['nearestneighbors'].kneighbors(vec, n_neighbors=5)
    results = internships.iloc[indices[0]].copy()
    results["similarity"] = (1 - distances[0])
    return results.to_dict(orient="records")

print(json.dumps(recommend(sector, location, tech)))