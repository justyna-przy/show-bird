## Local Development

1. **Clone the repo**  
```bash
 git clone https://github.com/justyna-przy/show-bird.git
 cd show-bird
```

2. **Install dependencies**
`npm install

3. **Create a .env file**
At the project root, create a file named .env and add:
```
NEXT_PUBLIC_SEPOLIA_RPC=https://sepolia.infura.io/v3/fdba5a5ef8f74105aa813cd5ef323fcd
PRIVATE_KEY=[included in project report
NEXT_PUBLIC_TICKET_TOKEN_ADDRESS=0xAE1DA8Cb1Eb5eb52C44b7C7E01760039424Ced28
NEXT_PUBLIC_TICKET_SALE_ADDRESS=0xc87E2babe79eEb58274585BBF7a081C0d1Fbc03b
NEXT_PUBLIC_VENUE_ADDRESS=0x6dac08d6de80289e311821f77f6fe859fff85605
```

4. **Run the development server**
	`npm run dev
	Then open http://localhost:3000 in your browser.

5. **Connect your wallet**
	Import the Venue private key (from your .env) into MetaMask and connect to access the Venue dashboard.
	Use any other funded Sepolia account to connect as an Attendee or Doorman.

## Vercel Deployment
The DApp is live on Vercel at: https://show-bird.vercel.app/
To use the hosted version:
1. Open the link in your browser.
2. Click Connect Wallet and select/import your wallet:
	Venue: import the same private key as above.
	Doorman / Attendee: use any other Sepolia account.
	The app will automatically show you only the pages your role permits.
3. You can then buy tickets, redeem at the door, or withdraw as Venue exactly as in local development.

## Troubleshooting
If you run into any issues—errors during setup, wallet connection problems, or anything else, please don’t hesitate to contact me!
