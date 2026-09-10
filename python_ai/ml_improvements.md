# ML Pipeline Future Improvements

This document outlines the necessary improvements for the ML pipeline to elevate it from a proof-of-concept to a highly rigorous academic and production-ready system.

## 1. N-Gram Vectorization (Sequential Awareness)
**The Problem:** The current `TfidfVectorizer` treats API calls as a "bag of words", ignoring the order in which they were called. 
**The Fix:** Update `train_model.py` to use N-Grams.
```python
# Change from:
TfidfVectorizer(max_features=500)
# To:
TfidfVectorizer(max_features=1500, ngram_range=(1, 3))
```
This forces the model to learn malicious *sequences* (e.g., `LdrLoadDll` -> `VirtualAllocEx` -> `CreateRemoteThread`) rather than just single isolated calls. This provides Transformer-like sequential awareness while maintaining the speed of a Random Forest.

## 2. Expanded MITRE ATT&CK Dictionary
**The Problem:** The current `MITRE_MAPPING` in `ai_service.py` is hardcoded to only 8 API calls. If SHAP flags a highly suspicious API like `NtCreateUserProcess`, it falls back to "Unknown Tactic".
**The Fix:** Expand the dictionary to cover the top 50-100 Windows API calls commonly abused by malware. 
*Example additions:*
- `NtCreateUserProcess` -> Execution (TA0002)
- `RegSetValueEx` -> Persistence (TA0003)
- `SetWindowsHookEx` -> Credential Access (TA0006)
- `AdjustTokenPrivileges` -> Privilege Escalation (TA0004)

## 3. Academic Rigor: Hyperparameter Tuning
**The Problem:** The Random Forest uses default parameters (`n_estimators=100`, max depth=unlimited). Academic reviewers expect proof that the model is mathematically optimized.
**The Fix:** Implement `GridSearchCV` or `RandomizedSearchCV` in `train_model.py` to find the optimal parameters.
```python
from sklearn.model_selection import GridSearchCV
# Example grid to search
param_grid = {
    'classifier__n_estimators': [50, 100, 200],
    'classifier__max_depth': [None, 10, 20],
    'tfidf__max_features': [500, 1000, 2000]
}
```
This proves that the reported Zero-Day Catch Rate is robust and not just a fluke of the default settings.

## 4. Class Imbalance & Threshold Tuning
**The Problem:** The Random Forest predicts "Denied" if the probability is > 50%. In kernel security, a false positive is highly destructive.
**The Fix:** We should output the raw probability from the model and adjust the decision threshold. E.g., Only block if `Malware Probability > 80%`. 
```python
# In ai_service.py
probability = model.predict_proba(X_input)[0][1] # Probability of class 1 (Malware)
if probability > 0.85:
    new_state = "Denied"
```
This ensures we are tuning the model explicitly to minimize false positives, which is a major concern for eBPF file blocking.
