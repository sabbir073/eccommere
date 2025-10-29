# E-Commerce Platform

A complete, production-ready e-commerce platform built with Next.js 16, TypeScript, Tailwind CSS, and MySQL.

## Features

### Customer Features
- Browse products by category with multi-level navigation
- Advanced product search with filters (price, brand, rating, availability)
- Product variants (size, color, etc.)
- Product reviews and ratings
- Shopping cart (session-based for guests, database for logged-in users)
- Guest and logged-in checkout
- User dashboard (order history, wishlist, saved addresses)
- Cash on Delivery payment
- Email notifications for orders
- SEO optimized pages

### Admin Features
- Dashboard with sales overview and statistics
- Product management (CRUD with variants and multiple images)
- Category management (multi-level structure with icons)
- Order management with status updates
- Review moderation (approve/reject)
- SweetAlert2 notifications for better UX

### Technical Features
- Next.js 16 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- SweetAlert2 for beautiful notifications
- MySQL database
- cPanel FTP for image storage
- JWT authentication with HTTP-only cookies
- SMTP email notifications
- Server-side rendering for SEO
- Responsive design
- Form validation with Zod
- Shipping cost calculation (Dhaka: 80 BDT, Outside: 150 BDT)

## Project Structure

```
ecommerce-platform/
├── app/
│   ├── (frontend)/          # Customer-facing pages
│   │   ├── page.tsx          # Home page
│   │   ├── products/         # Product listing and details
│   │   ├── category/         # Category pages
│   │   ├── search/           # Search page
│   │   ├── cart/             # Shopping cart
│   │   ├── checkout/         # Checkout process
│   │   ├── auth/             # Login/Register
│   │   └── account/          # User dashboard
│   ├── admin/               # Admin panel
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── orders/
│   │   └── users/
│   ├── api/                 # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── products/        # Product endpoints
│   │   ├── categories/      # Category endpoints
│   │   ├── orders/          # Order endpoints
│   │   ├── cart/            # Cart endpoints
│   │   ├── wishlist/        # Wishlist endpoints
│   │   ├── reviews/         # Review endpoints
│   │   └── upload/          # Image upload endpoint
│   ├── globals.css
│   └── layout.tsx
├── components/              # Reusable components
│   ├── layout/             # Header, Footer, Navigation
│   ├── product/            # Product cards, grids
│   ├── forms/              # Form components
│   └── ui/                 # Buttons, inputs, etc.
├── lib/                    # Utilities and configurations
│   ├── db.ts               # Database connection
│   ├── auth.ts             # Authentication utilities
│   ├── email.ts            # Email sending functions
│   ├── upload.ts           # Image upload utilities
│   ├── sweetalert.ts       # SweetAlert2 utilities
│   ├── types.ts            # TypeScript types
│   ├── validations.ts      # Zod schemas
│   └── utils.ts            # Helper functions
├── public/                 # Static assets
├── database-schema.sql     # MySQL database schema
├── .env.example            # Environment variables template
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Installation

### Prerequisites
- Node.js 18+ installed
- MySQL server running
- cPanel hosting with FTP access (for production)

### Setup Steps

1. **Clone or extract the project**
   ```bash
   cd ecommerce-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   - Create a MySQL database
   - Import the schema:
     ```bash
     mysql -u your_username -p your_database_name < database-schema.sql
     ```

4. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Update all values with your credentials:
     ```env
     DB_HOST=localhost
     DB_USER=your_mysql_username
     DB_PASSWORD=your_mysql_password
     DB_NAME=ecommerce_db
     DB_PORT=3306

     CPANEL_FTP_HOST=your_cpanel_host
     CPANEL_FTP_USER=your_ftp_username
     CPANEL_FTP_PASSWORD=your_ftp_password
     CPANEL_FTP_PORT=21
     CPANEL_IMAGE_BASE_URL=https://your-domain.com/uploads

     JWT_SECRET=your_super_secret_key_min_32_characters

     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     SMTP_USER=your_email@gmail.com
     SMTP_PASSWORD=your_app_password
     SMTP_FROM=noreply@yourstore.com

     NEXT_PUBLIC_APP_URL=http://localhost:3000

     SHIPPING_INSIDE_DHAKA=80
     SHIPPING_OUTSIDE_DHAKA=150
     ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin
   - Default admin credentials:
     - Email: admin@ecommerce.com
     - Password: admin123 (Change this immediately!)

## Database Schema

The database includes the following tables:

- **users**: User accounts (customers and admins)
- **categories**: Multi-level product categories
- **products**: Product catalog
- **product_images**: Product image gallery
- **product_variants**: Product variations (size, color, etc.)
- **product_reviews**: Customer reviews and ratings
- **addresses**: User saved addresses
- **orders**: Customer orders
- **order_items**: Order line items
- **cart**: Shopping cart (for logged-in users)
- **wishlist**: User wishlists
- **email_subscriptions**: Newsletter subscriptions

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products (with filters)
- `GET /api/products/[slug]` - Get product details
- `POST /api/products` - Create product (admin)
- `PUT /api/products/[id]` - Update product (admin)
- `DELETE /api/products/[id]` - Delete product (admin)

### Categories
- `GET /api/categories` - List all categories
- `GET /api/categories/[slug]` - Get category with products
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/[id]` - Update category (admin)
- `DELETE /api/categories/[id]` - Delete category (admin)

### Orders
- `GET /api/orders` - List user orders
- `GET /api/orders/[id]` - Get order details
- `POST /api/orders` - Create order (checkout)
- `PUT /api/orders/[id]` - Update order status (admin)

### Cart
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add to cart
- `PUT /api/cart/[id]` - Update cart item
- `DELETE /api/cart/[id]` - Remove from cart

### Wishlist
- `GET /api/wishlist` - Get wishlist items
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/[id]` - Remove from wishlist

### Reviews
- `GET /api/reviews` - Get reviews with filters
- `POST /api/reviews` - Create review
- `PUT /api/reviews/[id]` - Update review approval (admin)
- `DELETE /api/reviews/[id]` - Delete review (admin)

### User Profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password
- `GET /api/users/addresses` - Get user addresses
- `POST /api/users/addresses` - Add address
- `PUT /api/users/addresses/[id]` - Update address
- `DELETE /api/users/addresses/[id]` - Delete address

### Upload
- `POST /api/upload` - Upload image to cPanel

## Development

### Building for Production
```bash
npm run build
npm start
```

### Code Structure Guidelines

1. **API Routes**: All API routes return JSON with this format:
   ```typescript
   {
     success: boolean;
     data?: any;
     error?: string;
     message?: string;
   }
   ```

2. **Authentication**: Use `getCurrentUser()` to get the authenticated user in API routes

3. **Database Queries**: Use the query helper functions from `lib/db.ts`

4. **Form Validation**: All forms use Zod schemas from `lib/validations.ts`

5. **SEO**: Each page has proper metadata using Next.js metadata API

## Deployment

### Production Checklist

1. Change default admin password
2. Update all environment variables
3. Set up proper SSL certificate
4. Configure production database
5. Set up email service (SMTP)
6. Configure cPanel FTP for image uploads
7. Enable production mode:
   ```bash
   npm run build
   npm start
   ```

### Hosting Recommendations
- **Frontend**: Vercel, Netlify, or any Node.js hosting
- **Database**: MySQL hosting (shared, VPS, or cloud)
- **Images**: cPanel hosting with FTP access

## Security

- Passwords hashed with bcrypt
- JWT for session management
- HTTP-only cookies
- SQL injection protection with parameterized queries
- Input validation with Zod
- CSRF protection (built into Next.js)
- XSS protection (React escapes by default)

## Support

For issues or questions:
1. Check the code comments
2. Review the database schema
3. Check environment variables
4. Review API endpoint documentation

## License

Private - All rights reserved

## Credits

Built with:
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- SweetAlert2
- MySQL
- Nodemailer
- bcryptjs
- jsonwebtoken
- Zod
- basic-ftp



Login Credentials:
Admin:
Email: admin@alabili.com
Password: password123

All Users:
Password: password123