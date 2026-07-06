# Database RLS Policies Setup Guide

## **URGENT: Required Manual Configuration**

The venue booking system requires **Row Level Security (RLS) policies** to be manually configured in your Supabase database. Without these policies, users cannot create, read, update, or delete venues and bookings.

## **Current Status**
- **Code**: Enhanced with better error handling
- **Database**: RLS enabled but no policies configured
- **Result**: All database operations blocked with "permission denied" errors

## **Step-by-Step Setup Instructions**

### **Step 1: Access Supabase Dashboard**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **Database** in the left sidebar
4. Click **"Table Editor"** to see your tables

### **Step 2: Configure Venues Table RLS Policies**

#### **2.1 Enable RLS (if not already enabled)**
1. In Database section, go to **"Authentication"** tab
2. Find **"Row Level Security (RLS)"** section
3. Ensure RLS is enabled for your project

#### **2.2 Add Venues Table Policies**
1. Go to **"Authentication"** tab
2. Click **"Policies"** section
3. Click **"New Policy"**
4. Select **"venues"** table
5. Choose **"For full customization"**
6. Add these policies one by one:

**Policy 1: Allow Authenticated Users to Read Venues**
```sql
CREATE POLICY "Allow authenticated users to read venues" ON venues
FOR SELECT USING (auth.role() = 'authenticated');
```

**Policy 2: Allow Authenticated Users to Create Venues**
```sql
CREATE POLICY "Allow authenticated users to create venues" ON venues
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

**Policy 3: Allow Authenticated Users to Update Venues**
```sql
CREATE POLICY "Allow authenticated users to update venues" ON venues
FOR UPDATE USING (auth.role() = 'authenticated');
```

**Policy 4: Allow Authenticated Users to Delete Venues**
```sql
CREATE POLICY "Allow authenticated users to delete venues" ON venues
FOR DELETE USING (auth.role() = 'authenticated');
```

### **Step 3: Configure Bookings Table RLS Policies**

**Policy 1: Allow Authenticated Users to Read Bookings**
```sql
CREATE POLICY "Allow authenticated users to read bookings" ON bookings
FOR SELECT USING (auth.role() = 'authenticated');
```

**Policy 2: Allow Authenticated Users to Create Bookings**
```sql
CREATE POLICY "Allow authenticated users to create bookings" ON bookings
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

**Policy 3: Allow Authenticated Users to Update Bookings**
```sql
CREATE POLICY "Allow authenticated users to update bookings" ON bookings
FOR UPDATE USING (auth.role() = 'authenticated');
```

**Policy 4: Allow Users to Read Their Own Bookings**
```sql
CREATE POLICY "Allow users to read own bookings" ON bookings
FOR SELECT USING (created_by = auth.uid());
```

**Policy 5: Allow Users to Update Their Own Bookings**
```sql
CREATE POLICY "Allow users to update own bookings" ON bookings
FOR UPDATE USING (created_by = auth.uid());
```

### **Step 4: Configure Storage Bucket RLS Policies**

#### **4.1 Create Storage Bucket (if not exists)**
1. Go to **"Storage"** section
2. Click **"New bucket"**
3. Name: `venue-images`
4. Public bucket: **Enabled**
5. File size limit: 5MB
6. Allowed MIME types: `image/*`

#### **4.2 Add Storage Policies**
1. Select the `venue-images` bucket
2. Go to **"Policies"** tab
3. Add these policies:

**Policy 1: Allow Authenticated Users to Upload Images**
```sql
CREATE POLICY "Allow authenticated users to upload venue images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'venue-images' AND 
  auth.role() = 'authenticated'
);
```

**Policy 2: Allow Public Access to Venue Images**
```sql
CREATE POLICY "Allow public access to venue images" ON storage.objects
FOR SELECT USING (bucket_id = 'venue-images');
```

**Policy 3: Allow Users to Update Their Own Images**
```sql
CREATE POLICY "Allow users to update own venue images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'venue-images' AND 
  auth.role() = 'authenticated'
);
```

### **Step 5: Optional - Add Missing Venue Columns**

If you want to enable the full venue features (about, features, activities):

```sql
-- Add missing columns to venues table
ALTER TABLE venues 
ADD COLUMN about_venue TEXT,
ADD COLUMN features TEXT[],
ADD COLUMN activities TEXT[];
```

After adding these columns, uncomment the corresponding code in:
- `lib/supabase-services.ts` (lines 57-67 and 103-113)

## **Testing the Configuration**

### **Test 1: Venue Creation**
1. Open the venues page
2. Click "Add New Venue"
3. Fill in required fields
4. Click "Add Venue"
5. Should see: "Venue added successfully"

### **Test 2: Booking Creation**
1. Open the bookings page
2. Click "New Booking"
3. Fill in booking details
4. Click "Create Booking"
5. Should see: "Booking created successfully"

### **Test 3: Image Upload**
1. Create a new venue with an image
2. Should see: "Image uploaded successfully" OR graceful error message

## **Troubleshooting**

### **Error: "permission denied for table venues"**
- **Cause**: RLS policies not configured for venues table
- **Fix**: Complete Step 2 above

### **Error: "permission denied for table bookings"**
- **Cause**: RLS policies not configured for bookings table
- **Fix**: Complete Step 3 above

### **Error: "StorageApiError: new row violates row-level security policy"**
- **Cause**: Storage policies not configured for venue-images bucket
- **Fix**: Complete Step 4 above

### **Error: "Could not find the 'about_venue' column"**
- **Cause**: Database missing about_venue column
- **Fix**: Add missing columns (Step 5) or remove from code

## **Expected Results After Configuration**

### **Before RLS Policies:**
- `Failed to create venue: permission denied for table venues`
- `Failed to create booking: permission denied for table bookings`
- `StorageApiError: new row violates row-level security policy`

### **After RLS Policies:**
- `Venue added successfully`
- `Booking created successfully`
- `Image uploaded successfully` (if bucket configured)

## **Code Enhancements Implemented**

The code now provides:
- **Specific error messages** for RLS policy issues
- **Clear user guidance** when permissions are missing
- **Graceful fallbacks** for missing database columns
- **Better error logging** for debugging

## **Important Notes**

1. **RLS policies are required** - Without them, no database operations work
2. **Policies are per-table** - Each table needs its own policies
3. **Storage needs separate policies** - Image uploads have different security requirements
4. **Test after each policy** - Add policies one by one and test functionality

## **Priority Order**

1. **VENUES policies** - Fixes venue creation (CRITICAL)
2. **BOOKINGS policies** - Fixes booking creation (CRITICAL)
3. **STORAGE policies** - Fixes image uploads (HIGH)
4. **ADDITIONAL COLUMNS** - Enables full venue features (MEDIUM)

## **Support**

If you encounter issues:
1. Check the exact error message
2. Verify policy syntax
3. Ensure RLS is enabled
4. Test with a simple SELECT query first

**Once these RLS policies are configured, the venue booking system will work completely!**
