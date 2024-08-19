# Hotel Booking Backend API


## Table of Contents
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [XML Processing](#xml-processing)
- [Payment Integration](#payment-integration)
- [API Endpoints](#api-endpoints)
- [Refresh Token Implementation](#refresh-token-implementation)
- [Setup and Installation](#setup-and-installation)
- [Design Choices](#design-choices)

## Technology Stack

-  Node.js : A JavaScript runtime built on Chrome's V8 engine.
-  NestJS : A framework for building scalable server-side applications.
-  TypeScript : A statically typed superset of JavaScript.
-  JWT (JSON Web Tokens) : For secure user authentication.
-  Swagger : For API documentation.
-  xml2js : A library for converting XML to JSON.

## Project Structure

src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.service.ts
│   └── jwt.strategy.ts
├── booking/
│   ├── booking.controller.ts
│   ├── booking.module.ts
│   ├── booking.service.ts
│   └── xml.service.ts
├── payment/
│   ├── payment.controller.ts
│   ├── payment.module.ts
│   └── payment.service.ts
└── app.module.ts
```

## Authentication

### Features
- User Registration: Allows users to sign up using their email and password.
- JWT Authentication: Issues access and refresh tokens to authenticate and maintain user sessions.
- Google Login: Enables users to log in using their Google account

### How It Works
1. User Signup: Users register by providing an email and password. Passwords are hashed before storage.
2. Login: Upon successful login, the server issues a JWT access token and a refresh token, both stored in HTTP-only cookies.
3. Token Refresh: When the access token expires, the refresh token is used to obtain a new access-refresh token pair, maintaining session continuity.

## XML Processing

### Features
- Custom XML to JSON Conversion : Implements a custom recursive function to convert XML data into JSON, optimized for time complexity.
- Library-based XML to JSON Conversion : Uses the `xml2js` library to parse XML data into JSON.

### How It Works
1.  Custom Parser : The `parseXmlWithoutLibrary` method reads the XML file, parses it using a recursive algorithm, and converts it to JSON.
2.  Library Parser : The `parseXmlWithLibrary` method uses `xml2js` to achieve the same goal with less custom code.

### Example XML to JSON Conversion

Given an XML file, the custom parser converts it to a JSON structure that mirrors the hierarchy and attributes of the original XML.

## Payment Integration

### Features
-  Payment Processing : The application integrates with Vietcombank’s payment gateway to handle transactions.
-  Redirection Based on Transaction Outcome : Users are redirected to success or failure pages based on the transaction result.

### How It Works
1.  Initiate Payment : The `/payment/<confirmation_no>` endpoint retrieves the booking data, calculates the payment amount, and generates a Vietcombank payment URL.
2.  Handle Response : Upon payment completion, the user is redirected to either a success or failure page hosted on the frontend.

### Example Flow
-  Request : `POST /payment/531340616`
-  Redirect : To Vietcombank payment page with the specified amount.
-  Post-Payment : Redirect to either `/payment-success` or `/payment-fail` based on the outcome.

## API Endpoints

### Auth Endpoints
-  POST `/auth/signup` : Registers a new user.
-  POST `/auth/login` : Logs in a user and issues JWT tokens.
-  POST `/auth/refresh` : Refreshes the JWT tokens.

### Booking Endpoints
-  GET `/booking/<confirmation_no>` : Retrieves booking information using the library-based XML to JSON conversion.
-  GET `/booking/custom/<confirmation_no>` : Retrieves booking information using the custom XML to JSON conversion.

### Payment Endpoints
-  POST `/payment/<confirmation_no>` : Processes payment for the booking and redirects to Vietcombank’s payment page.

## Refresh Token Implementation

-  Rotation : The refresh token is rotated each time the access token is renewed. This prevents replay attacks and ensures that old tokens cannot be reused.
-  Storage : Both the access and refresh tokens are stored in HTTP-only cookies, ensuring they are not accessible via JavaScript on the client side.

## Setup and Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation Steps
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd hotel-booking-backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the application:
   ```bash
   npm run start
   ```


### Design Choices

#### 1.  NestJS Framework 

NestJS was selected for its scalable and modular architecture, which is particularly beneficial for structuring larger applications. The framework's use of TypeScript ensures type safety and clear documentation, making the development process more robust and maintainable.

-  Dependency Injection : 
  - Example: In `BookingController` (`src/booking/booking.controller.ts`), the `XmlService` and `PaymentService` are injected to handle XML parsing and payment processing:
    ```typescript
    constructor(
      private readonly xmlService: XmlService,
      private readonly bookingService: BookingService,
      private readonly paymentService: PaymentService,
    ) {}
    ```

-  Modularity :
  - Each feature is organized into its own module (e.g., `AuthModule`, `BookingModule`, `PaymentModule`), which promotes separation of concerns and enhances maintainability.
  - Example: In `BookingModule` (`src/booking/booking.module.ts`):
    ```typescript
    @Module({
      imports: [PaymentModule],
      controllers: [BookingController],
      providers: [BookingService, XmlService],
    })
    export class BookingModule {}
    ```

#### 2.  XML Processing 

The system processes booking data stored in XML format using two different methods provided by `XmlService`:

-  Library-based Parsing : Uses the `xml2js` library to convert XML into JSON.
  ```typescript
  async parseXmlWithLibrary(confirmationNo: string): Promise<any> {
    const filePath = join(process.cwd(), 'src', 'XML', `booking_${confirmationNo}.xml`);
    const xmlData = readFileSync(filePath, 'utf8');
    const jsonData = await parseStringPromise(xmlData);
    return jsonData;
  }
  ```

-  Manual Parsing : This method involves manually parsing XML using `DOMParser`, which provides more control over the parsing process.
  ```typescript
  parseXmlWithoutLibrary(confirmationNo: string): any {
    const filePath = join(process.cwd(), 'src', 'XML', `booking_${confirmationNo}.xml`);
    const xmlData = readFileSync(filePath, 'utf8');
    const domParser = new DOMParser();
    const doc = domParser.parseFromString(xmlData, 'application/xml');
    return this.xmlElementToJson(doc.documentElement);
  }
  ```

#### 3.  JWT Authentication and Refresh Tokens 

The application implements JWT-based authentication with a focus on security and scalability:

-  Token Generation and Rotation :
  - The system generates and rotates JWT tokens for access and refresh purposes, ensuring that users remain authenticated without requiring frequent logins.
  - Example: `AuthService` handles the refresh token logic, creating new tokens when the old one expires:
    ```typescript
    async refreshToken(oldToken: string): Promise<{ accessToken: string, refreshToken: string }> {
      // Validate oldToken and generate new access and refresh tokens
      const newAccessToken = this.jwtService.sign(payload);
      const newRefreshToken = this.jwtService.sign(refreshPayload, { expiresIn: '7d' });
      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    }
    ```

-  HTTP-Only Cookies : 
  - Tokens are stored in HTTP-only cookies to mitigate XSS risks.
  - Example: `AuthController` manages token storage in cookies:
    ```typescript
    @Post('refresh')
    refresh(@Req() req, @Res() res) {
      const refreshToken = req.cookies['refreshToken'];
      const tokens = this.authService.refreshToken(refreshToken);
      res.cookie('accessToken', tokens.accessToken, { httpOnly: true });
      res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true });
      res.send(tokens);
    }
    ```

#### 4.  Payment Integration 

Payment integration is managed through `PaymentService`, which interacts with Vietcombank's payment gateway:

-  Generating Payment URL :
  - The service generates a URL that directs the user to Vietcombank's payment page based on the booking data.
  - Example: `PaymentService` extracts the amount from the XML data and creates the payment URL:
    ```typescript
    async generatePaymentUrl(confirmationNo: string): Promise<string> {
      const bookingData = await this.xmlService.parseXmlWithLibrary(confirmationNo);
      const amount = bookingData.HotelReservation.RoomStays.RoomStay[0].TotalAmount; // Extract amount
      const paymentUrl = `https://payment.vietcombank.com.vn/pay?amount=${amount}&order=${confirmationNo}`;
      return paymentUrl;
    }
    ```

-  Handling Payment :
  - Payments are initiated through the `PaymentController`, which uses the `PaymentService` to handle the transaction.
  - Example: In `PaymentController`:
    ```typescript
    @Post('payment/:confirmationNo')
    async initiatePayment(@Param('confirmationNo') confirmationNo: string, @Res() res) {
      const paymentUrl = await this.paymentService.handlePayment(confirmationNo);
      res.redirect(paymentUrl);
    }
    ```
