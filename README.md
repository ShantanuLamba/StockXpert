# StockXpert

StockXpert is a comprehensive stock trading simulator designed to provide an immersive and educational experience for aspiring traders. With real-time data, interactive charts, and a user-friendly interface, StockXpert helps users practice trading and develop their skills in a risk-free environment.

## Features

- **Real-Time Stock Prices**: Get up-to-date stock prices using the Alpha Vantage API.
- **Interactive Trading Charts**: View and analyze stock performance with integrated TradingView widgets.
- **Personalized Trading Experience**: Track your portfolio, view open positions, and manage your trades with ease.
- **Secure User Authentication**: Register and login securely to keep your trading data private.
- **Dynamic Stock Trading**: Buy and sell stocks dynamically and see how your decisions impact your portfolio.
- **Balance Management**: Keep track of your total balance and trading history.


## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/StockXpert.git
    ```

2. **Navigate to the project directory:**
    ```bash
    cd StockXpert
    ```

3. **Install dependencies:**
    ```bash
    npm install
    ```

4. **Set up environment variables:**
    Create a `.env` file in the root directory and add your Alpha Vantage API key and other necessary environment variables:
    ```env
    ALPHA_VANTAGE_API_KEY=your_api_key_here
    ```

5. **Start the development server:**
    ```bash
    npm start
    ```

6. **Access the application:**
    Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Register an Account:**
   - Visit the registration page and create a new account.

2. **Login:**
   - Login with your registered credentials.

3. **Trade Stocks:**
   - Navigate to the trading page, select a stock, and perform buy/sell operations.

4. **View Open Positions:**
   - Check your current open positions and manage your portfolio.

## API Reference

- **Alpha Vantage API**: Used to fetch real-time stock prices. [Alpha Vantage](https://www.alphavantage.co/)

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes. Make sure to follow the [contribution guidelines](CONTRIBUTING.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

