# Brand Library File Manager

![Project Screenshot](image/screenshot.png)

## Overview

The **Brand Library File Manager** is a web-based application for organizing and managing digital assets (e.g., banners, logos, emails) across multiple brands and categories. It offers a responsive interface for uploading, viewing, searching, and deleting files, with secure login and role-based access (admin and standard users). Files are stored in an AWS S3 bucket (`affwlresources`) and served via CloudFront for efficient access.

Key features include file previews, dynamic category creation, and admin-only file deletion. The backend uses Node.js/Express, and the frontend is built with vanilla JavaScript, styled with CSS and Font Awesome icons.

## Features

- **Secure Authentication**: Login with admin (delete privileges) or standard user roles.
- **File Management**:
  - Upload multiple files with uploader metadata.
  - View files with image previews or icons for other formats.
  - Download files or open in new tabs.
  - Delete files (admin-only).
- **Search**: Global search across all brands and categories.
- **Organization**: Categorize files by brands (e.g., Cricpayz, Cryptozpay) and categories (e.g., Banners, Logos).
- **Dynamic Categories**: Add custom categories via the UI.
- **Responsive Design**: Mobile-friendly with animations and a dark theme.
- **Caching**: Client-side file caching for faster load times.
- **Accessibility**: Keyboard navigation for modals.

## Technologies

- **Frontend**:
  - HTML5, CSS3 (gradients, animations, Font Awesome)
  - Vanilla JavaScript (DOM manipulation, API calls)
- **Backend**:
  - Node.js with Express.js
  - AWS SDK (S3 for storage, CloudFront for CDN)
  - Multer for file uploads
  - UUID for unique file identifiers
- **Database**: MySQL (configured but unused in current code)
- **Security**:
  - HTTPS with SSL certificates
  - CORS for controlled access
  - dotenv for environment variables
- **Dependencies**:
  - `express`, `multer`, `@aws-sdk/client-s3`, `uuid`, `cors`, `mysql2`, `dotenv`

## Prerequisites

- **Node.js**: v14 or higher
- **AWS Account**: S3 bucket (`affwlresources`) and CloudFront distribution
- **MySQL**: Configured database (optional, as not currently used)
- **SSL Certificates**: For HTTPS server
- **Environment Variables**: Configured via `.env`

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/brand-library-file-manager.git
   cd brand-library-file-manager
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   - Copy the `.env.example` file to create a `.env` file:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` with your credentials:
     ```env
     AWS_ACCESS_KEY_ID=your_aws_access_key
     AWS_SECRET_ACCESS_KEY=your_aws_secret_key
     AWS_REGION=us-east-1
     S3_BUCKET_NAME=affwlresources
     DB_HOST=localhost
     DB_USER=your_mysql_user
     DB_PASSWORD=your_mysql_password
     DB_NAME=file_uploads
     port=3003
     ADMIN_USERNAME=admin_username
     ADMIN_PASSWORD=admin_password
     ADMIN_ROLE=admin
     STAFF_USERNAME=staff_username
     STAFF_PASSWORD=staff_password
     STAFF_ROLE=standard
     ```
   - **Important**: Do not commit `.env` to GitHub. It is included in `.gitignore` to protect sensitive data.

4. **Configure SSL Certificates**:
   Update `server.js` with paths to your SSL files (e.g., `key.pem`, `crt.pem`, `chain.pem`).

5. **Run the Server**:
   ```bash
   node server.js
   ```
   The server runs on `https://localhost:3003`.

6. **Access the Application**:
   Open `https://localhost:3003` in a browser.

## Usage

1. **Login**:
   - Use credentials from `.env` (e.g., admin or staff).
   - Admins can delete files; standard users can view/upload.

2. **Dashboard**:
   - **Navigation**: Select a brand (e.g., Cricpayz) and category (e.g., Banners).
   - **Upload**: Enter uploader name, select files, and click the upload button.
   - **View/Download**: Click file previews or download buttons to open files.
   - **Search**: Use the search icon to find files across all brands/categories.
   - **Add Categories**: Click the "+" icon next to "Categories" to create a new category.
   - **Delete Files** (admin-only): Click the trash icon on a file card.

3. **Logout**:
   - Click the logout button in the header.

## Configuration

- **AWS S3**: Bucket `affwlresources` in `us-east-1` with `public-read` ACL.
- **CloudFront**: Distribution pointing to `affwlresources` (e.g., `d20h2he2gi3v2g.cloudfront.net`).
- **MySQL**: Configured for `file_uploads` database (not currently used; for future expansion).
- **CORS**: Update `server.js` CORS origin to your production domain (e.g., `https://arhamanand.com`).
- **File Storage**: Files stored as `brand/category/filename` in S3.
- **Categories**: Stored in-memory (persists until server restart).

## API Endpoints

- **POST /login**: Authenticate users (`{ username, password }`).
- **GET /list-files**: List files (`?brand=X&category=Y`).
- **POST /upload**: Upload files with metadata (`multipart/form-data`).
- **DELETE /delete-file**: Delete a file (admin-only, `{ fileKey, username }`).
- **GET /categories**: Retrieve custom categories.
- **POST /add-category**: Add a new category (`{ category }`).

## Troubleshooting

- **CORS Errors**: Ensure `server.js` CORS origin matches your frontend domain.
- **AWS Issues**: Verify AWS credentials, bucket permissions, and region.
- **File Previews**: Non-image files show icons; ensure Font Awesome CDN is accessible.
- **MySQL**: Not currently used; ensure DB credentials are correct if implemented.
- **HTTPS**: Validate SSL certificate paths and files.

## Future Improvements

- **Database Integration**: Use MySQL for persistent user/category storage.
- **Pagination**: Add for large file lists.
- **File Validation**: Prevent duplicate uploads server-side.
- **User Management**: Expand beyond hardcoded users in `.env`.
- **Analytics**: Track file downloads/uploads.

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/new-feature`.
3. Commit changes: `git commit -m 'Add new feature'`.
4. Push to the branch: `git push origin feature/new-feature`.
5. Open a Pull Request.

Adhere to coding style and include tests where possible.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

- AWS for S3 and CloudFront integration.
- Font Awesome for icons.
- Express.js and Multer for backend functionality.

For issues or questions, open a GitHub issue or contact the maintainer.