# Bot Digi - DigiFlazz Transaction Bot

![Bot Digi Logo](./img/image.jpeg)

## Overview

- Bot Digi is a WhatsApp-based transaction bot integrated with the DigiFlazz API for seamless digital product transactions. This bot enables users to purchase various digital products such as mobile credits, data packages, game vouchers, and bill payments directly through WhatsApp.
- Bot Digi merupakan bot transaksi berbasis WhatsApp yang terintegrasi dengan API DigiFlazz untuk transaksi produk digital yang lancar. Bot ini memungkinkan pengguna untuk membeli berbagai produk digital seperti pulsa seluler, paket data, voucher game, dan pembayaran tagihan langsung melalui WhatsApp.

## Features

- **Automated Transactions**: Process digital product purchases automatically
- **Real-time Balance Checking**: Check DigiFlazz account balance instantly
- **Transaction History**: View past transactions and their status
- **Product List**: Get updated product lists with pricing
- **User Management**: Track and manage user accounts
- **Notification System**: Receive automated transaction status updates

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/botwa-digiflazz.git

# Navigate to project directory
cd botwa-digiflazz

# Install dependencies
npm install

# Configure your environment variables
cp .env.example .env
```

## Configuration

Configure your `.env` file with the necessary credentials:

```yaml
DIGIFLAZZ_USERNAME=your_username
DIGIFLAZZ_API_KEY=your_api_key
WHATSAPP_NUMBER=your_whatsapp_number
# Add other required configuration
```

## Usage

```bash
# Start the bot in development mode
npm run dev

# Start the bot in production mode
npm start
```

## Commands

| Command | Description |
|---------|-------------|
| `/balance` | Check DigiFlazz account balance |
| `/products` | View available products |
| `/buy <product_code> <phone_number>` | Purchase a product |
| `/status <transaction_id>` | Check transaction status |
| `/deposit` | Deposit  |
| `/help` | Display all available commands |

## Technical Requirements

- Node.js v14 or higher
- Active DigiFlazz account with API access
- WhatsApp business account or compatible number

## Development

Want to contribute? Great!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

- Developer: [Muqsith]
- Instagram: [@flyingcat121](https://instagram.com/flyingcat121)
- Email: [01muqsith@gmail.com]
- GitHub: [indonumberone](https://github.com/indonumberone)

---

Need customized features or having issues? Feel free to reach out!
