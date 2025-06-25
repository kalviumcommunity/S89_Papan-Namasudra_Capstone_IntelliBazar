# IntelliBazar Admin/Seller Dashboard Setup Guide

## Overview
This guide explains how to set up and use the new Admin/Seller Dashboard feature in IntelliBazar.

## Features Implemented

### 1. Enhanced Product Model
- Added seller information (sellerId, sellerName)
- Product images with Cloudinary integration
- Detailed specifications (brand, model, color, size, etc.)
- SEO and search optimization
- Product metrics (views, rating, sales count)
- Pricing with discount support

### 2. Comprehensive Product API
- **GET /api/products** - Get all products (public)
- **GET /api/products/seller** - Get seller's products (authenticated)
- **GET /api/products/:id** - Get single product (public)
- **POST /api/products** - Add new product (seller/admin only)
- **PUT /api/products/:id** - Update product (seller/admin only)
- **DELETE /api/products/:id** - Delete product (seller/admin only)
- **DELETE /api/products/:id/images/:imageId** - Delete specific image
- **GET /api/products/categories/stats** - Get category statistics

### 3. Admin/Seller Dashboard Frontend
- Product management interface
- Add/Edit/Delete products
- Image upload with preview
- Product specifications management
- Sales analytics and statistics
- Responsive design with gray/blackish theme

### 4. User Role Management
- Enhanced User model with seller information
- Seller application system
- Admin approval workflow
- Role-based access control

### 5. Shop Page Integration
- Combines database products with existing hardcoded products
- Maintains existing search and filter functionality
- Seamless user experience

## Setup Instructions

### 1. Environment Variables
Add the following to your `server/.env` file:

```env
# Cloudinary Configuration (Required for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. Database Migration
The new Product and User models will automatically create the required collections. No manual migration needed.

### 3. Create Admin User
To create an admin user, update a user's role in MongoDB:

```javascript
// In MongoDB Compass or shell
db.users.updateOne(
  { email: "admin@intellibazar.com" },
  { $set: { role: "admin" } }
)
```

### 4. Cloudinary Setup
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your Cloud Name, API Key, and API Secret from the dashboard
3. Update the environment variables in `server/.env`

## Usage Guide

### For Sellers

#### 1. Become a Seller
- Users can apply to become sellers through the API
- POST `/api/auth/apply-seller` with business information
- Admin approval required

#### 2. Access Dashboard
- Navigate to `/admin` (for sellers, it shows as "Seller Dashboard")
- Available in user dropdown menu in header

#### 3. Manage Products
- **Add Products**: Click "Add Product" button
- **Edit Products**: Click edit icon in product list
- **Delete Products**: Click delete icon (with confirmation)
- **Upload Images**: Support for multiple images per product
- **Set Specifications**: Brand, model, color, size, etc.
- **Pricing**: Set price, original price, and discount percentage

### For Admins

#### 1. Access Dashboard
- Navigate to `/admin` (shows as "Admin Dashboard")
- All seller features plus admin-specific functions

#### 2. Manage Seller Applications
- GET `/api/auth/seller-applications` - View applications
- POST `/api/auth/approve-seller/:userId` - Approve sellers

#### 3. Product Management
- Can edit/delete any product
- View all products across sellers
- Access to analytics and statistics

## API Authentication

All seller/admin routes require authentication:

```javascript
// Include JWT token in headers
headers: {
  'Authorization': `Bearer ${token}`
}
```

## Product Categories

Supported categories:
- electronics
- fashion  
- watches
- footwear
- home-decor
- books
- kitchen
- sports

## Image Upload

- Supports: JPG, JPEG, PNG, WebP
- Maximum file size: 5MB per image
- Maximum images per product: 5
- Automatic optimization and resizing
- CDN delivery via Cloudinary

## Testing

### 1. Test Product Creation
```bash
# Create a test product (requires authentication)
curl -X POST http://localhost:8080/api/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "name=Test Product" \
  -F "description=Test Description" \
  -F "price=999" \
  -F "category=electronics" \
  -F "stock=10" \
  -F "images=@/path/to/image.jpg"
```

### 2. Test Product Retrieval
```bash
# Get all products
curl http://localhost:8080/api/products

# Get seller products
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8080/api/products/seller
```

## Troubleshooting

### Common Issues

1. **Image Upload Fails**
   - Check Cloudinary credentials
   - Verify file size and format
   - Check network connectivity

2. **Access Denied**
   - Verify JWT token is valid
   - Check user role (must be seller or admin)
   - Ensure proper authentication headers

3. **Products Not Showing**
   - Check database connection
   - Verify API endpoints are working
   - Check browser console for errors

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
```

## Security Considerations

1. **File Upload Security**
   - Only image files allowed
   - File size limits enforced
   - Cloudinary handles file validation

2. **Access Control**
   - JWT token validation
   - Role-based permissions
   - Seller can only modify own products

3. **Data Validation**
   - Input sanitization
   - Required field validation
   - Category validation

## Performance Optimization

1. **Image Optimization**
   - Automatic compression via Cloudinary
   - Multiple format support
   - CDN delivery

2. **Database Indexing**
   - Indexed on sellerId, category, isActive
   - Text search index on name, description, tags
   - Optimized queries with pagination

3. **Caching**
   - Consider implementing Redis for product caching
   - Browser caching for static assets

## Future Enhancements

1. **Analytics Dashboard**
   - Sales reports
   - Product performance metrics
   - Revenue tracking

2. **Inventory Management**
   - Low stock alerts
   - Automatic reorder points
   - Bulk operations

3. **Advanced Features**
   - Product variants (size, color)
   - Bulk product import/export
   - Advanced search filters
   - Product reviews and ratings

## Support

For issues or questions:
1. Check this documentation
2. Review server logs
3. Check browser console
4. Verify API responses

## Version History

- **v1.0.0** - Initial admin dashboard implementation
  - Product management
  - Image upload
  - Seller role system
  - Shop page integration
