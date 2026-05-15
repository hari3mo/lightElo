import pandas as pd
import numpy as np
from sklearn.model_selection import GroupShuffleSplit
from sklearn.metrics import mean_absolute_error, mean_squared_error
from catboost import CatBoostRegressor
from lightgbm import LGBMRegressor
from xgboost import XGBRegressor



def main():
    df = pd.read_csv('data/lichess_features.csv')
    cat_cols = ['eco', 'category']
    df[cat_cols] = df[cat_cols].astype('category')

    # Split by game_id so white/black rows from the same game stay on one side
    gss = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
    train_idx, test_idx = next(gss.split(df, groups=df['game_id']))
    features = [c for c in df.columns if c not in ('game_id', 'elo')]
    X_tr, y_tr = df.iloc[train_idx][features], df.iloc[train_idx]['elo']
    X_te, y_te = df.iloc[test_idx][features],  df.iloc[test_idx]['elo']

    models = {
        'CatBoost': CatBoostRegressor(verbose=0, random_seed=42, cat_features=cat_cols),
        'LightGBM': LGBMRegressor(random_state=42, verbose=-1),
        'XGBoost':  XGBRegressor(random_state=42, enable_categorical=True, tree_method='hist'),
    }

    for name, model in models.items():
        model.fit(X_tr, y_tr)
        pred = model.predict(X_te)
        mae = mean_absolute_error(y_te, pred)
        rmse = np.sqrt(mean_squared_error(y_te, pred))
        print(f'{name:9s} MAE={mae:6.1f}  RMSE={rmse:6.1f}')
        
if __name__ == "__main__":
    main()