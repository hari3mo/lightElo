import pandas as pd

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

if __name__ == "__main__":
    main()