import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report
import joblib

def train():
    print("Loading data...")
    df = pd.read_csv('real_malware_dataset.csv')
    
    # The dataset has 'sha256', 'labels', and columns '0' to '176' for API calls
    # We will combine all API calls into a single string sequence
    api_cols = [col for col in df.columns if col not in ['sha256', 'labels']]
    
    # Forward fill or fillna with empty string, then join them
    df['api_sequence'] = df[api_cols].fillna('').astype(str).apply(lambda x: ' '.join(x), axis=1)
    
    X = df['api_sequence']
    y = df['labels'] # 0 for benign, 1 for malware
    
    # We use TF-IDF to vectorize the text (API call sequence)
    # This works great for sequential tokens
    clf = Pipeline(steps=[
        ('tfidf', TfidfVectorizer(max_features=500)),
        ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training model on API sequences (this might take a moment)...")
    clf.fit(X_train, y_train)
    
    print("Evaluating model...")
    y_pred = clf.predict(X_test)
    print(classification_report(y_test, y_pred))
    
    print("Saving model to model.joblib...")
    joblib.dump(clf, 'model.joblib')
    print("Done!")

if __name__ == '__main__':
    train()
