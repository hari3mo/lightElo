from sklearn.metrics import mean_absolute_error
import pandas as pd
import lightgbm

FEATURES_PATH = 'data/lichess_features.csv' # output from create_features.py
OUTPUT_PATH = 'models/lightgbm.txt' # export trained model

def main():
    df = pd.read_csv(FEATURES_PATH)
    cat_cols = ['eco', 'category', 'is_white']
    num_cols = ['acpl', 'blunders', 'mistakes', 'inaccuracies', 'avg_move_time',
                'time_trouble_moves', 'opening_speed', 'shift_move_time',
                'ply_count', 'eval_volatility']
    features = num_cols + cat_cols
    for col in cat_cols:
        df[col] = df[col].astype('category')

    # Split data on unique game IDs to avoid leakage between training and validation/test sets
    games = df['game_id'].drop_duplicates().values
    n = len(games)
    tr = set(games[:int(n*0.8)]) 
    va = set(games[int(n*0.8):]) 
    te = set(games[int(n*0.9):]) 

    train_df = df[df['game_id'].isin(tr)]
    val_df = df[df['game_id'].isin(va)]
    test_df = df[df['game_id'].isin(te)]

    X_tr, y_tr = train_df[features], train_df['elo']
    X_va, y_va = val_df[features], val_df['elo']
    X_te, y_te = test_df[features], test_df['elo']

    # Train LightGBM model
    tr_set = lightgbm.Dataset(X_tr, y_tr, categorical_feature=cat_cols)
    va_set = lightgbm.Dataset(X_va, y_va, categorical_feature=cat_cols, reference=tr_set)
    model = lightgbm.train(
    {'objective': 'regression', 'metric': 'mae', 'seed': 42, 'verbose': -1},
    train_set=tr_set,
    num_boost_round=2000,
    valid_sets=[va_set],
    callbacks=[lightgbm.early_stopping(100)]
)

    preds = model.predict(X_te)
    mae = mean_absolute_error(y_te, preds)
    print(f'Test MAE: {mae}')

    model.save_model(OUTPUT_PATH)

if __name__ == "__main__":
    main()