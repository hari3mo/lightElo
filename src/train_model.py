import pandas as pd

FEATURES_PATH = 'data/lichess_features.csv' # output from create_features.py
OUTPUT_PATH = 'models/lightgbm.txt' # export trained model

def main():
    df = pd.read_csv(FEATURES_PATH)
    games = df['game_id'].drop_duplicates().values
    n = len(games)
    tr, va = set(games[:int(n*0.8)]), set(games[int(n*0.8):]) # split data 80 / 10 into training and validation sets
    te = set(games[int(n*0.9):]) # use last 10% of data as test set
    train_df = df[df['game_id'].isin(tr)]
    val_df = df[df['game_id'].isin(va)]
    test_df = df[df['game_id'].isin(te)]

if __name__ == "__main__":
    main()