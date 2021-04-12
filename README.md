# Vinted - Backend

This is the backend API for Vinted project is made with Nodejs.
More information about this project on <a href="https://github.com/YoannMas/vinted-react">Frontend repository</a>.

## Dependencies

- express
- express formibable
- cloudinary
- mongoose
- cors
- stripe
- crypto-js
- iud2
- dotenv

## Routes

### Offer
- Publish new offer : /offer/publish
- Modify an offer : /offer/modify
- Delete an offer : /offer/delete
- Get all offers : /offers
- Get an offers by id : /offer/:id

### User
- Create an account : /user/signup
- Login : /user/login

### Payment
- Pay : /pay

## Setup instructions

Clone this repository 

```
git clone https://github.com/YoannMas/deliveroo-front-redux.git
```

Install dependencies

```
yarn install
```

Run it

```
yarn start
```
