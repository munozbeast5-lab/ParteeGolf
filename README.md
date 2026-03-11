# ParteeGolf Repository Overview

Welcome to the **ParteeGolf** repository! This README is designed to guide you through the essential features and functionalities of the project. Whether you're a beginner or just need a refresher, this guide covers everything you need.  

---

## Quick Start: Uploading Images to the Assets Folder
To upload images, follow these steps:
1. Navigate to the `assets` folder in your repository.  
2. Choose the subfolder you want to upload images to:
   - `assets/gallery`
   - `assets/testimonials`
   - `assets/team`
   - `assets/events`
3. Click on the "Upload files" button on GitHub.
4. Drag and drop your images into the upload interface.
5. Commit your changes with an appropriate message.  

### Example:
If you want to upload a new team picture:
1. Go to `assets/team`.
2. Click "Upload files" and drag your `team-photo.jpg` here.
3. Commit your changes: "Added new team photo."

---

## Editing `config.json`
The `config.json` file allows you to manage all business details, pricing, testimonials, FAQs, and social links without needing to modify any HTML.

### Explanation of Each Section:
- **Business Details**: Update your business's name, address, and contact information.  
   ```json
   "business": {
       "name": "Partee Golf",
       "address": "123 Golf Lane",
       "phone": "(555) 555-5555"
   }
   ```
- **Pricing**: Set your pricing information for services offered.  
   ```json
   "pricing": {
       "green_fee": 50,
       "membership_fee": 200
   }
   ```
- **Testimonials**: Add testimonials from clients.  
   ```json
   "testimonials": [
       {"name": "John Doe", "text": "Great service!"}
   ]
   ```
- **FAQ**: Edit and update questions and answers.  
   ```json
   "faq": [
       {"question": "What is your refund policy?", "answer": "No refunds after booking."}
   ]
   ```
- **Social Links**: Update links to your social media profiles.
   ```json
   "social": {
       "facebook": "facebook.com/partee",
       "instagram": "instagram.com/partee"
   }
   ```

### Enabling/Disabling Features
To enable or disable features, update the corresponding section in the `config.json` file:
```json
"features": {
    "new_booking": true,
    "testimonials": false
}
```

---

## Directory Structure Guide
- **assets/**: Contains all your media files.
- **assets/gallery/**: Images for your gallery.
- **assets/testimonials/**: Images related to testimonials.
- **assets/team/**: Photos of team members.
- **assets/events/**: Images for events.

---

## PWA Installation Instructions
1. Open the website in a Chromium-based browser.
2. Click the install button in the address bar.
3. Follow the prompts to install the app on your device.

---

## Performance Optimization Tips
- Compress images for faster load times. Use tools like [TinyPNG](https://tinypng.com).
- Utilize caching mechanisms to enhance performance.
- Regularly check and remove unused assets.

---

## Troubleshooting Common Issues
- **Images not displaying**: Check the file names and paths in your `config.json` to ensure they are correct.
- **PWA not installing**: Make sure your site is served over HTTPS and includes a valid manifest file.

---

We hope this README helps you get started with the **ParteeGolf** project! For any questions or additional support, feel free to reach out.  

Happy golfing!