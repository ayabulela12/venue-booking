# Supabase User Metadata Setup Guide

## **🔧 CORRECT SQL FOR SUPABASE**

The error occurs because Supabase uses a different structure. Here's the correct approach:

### **Method 1: Supabase SQL Editor (Recommended)**

```sql
-- Update existing admin user to system_admin
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{role}', '"system_admin"')
WHERE email = 'admin@venueops.gov';

-- Update existing operator user to local_admin  
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{role}', '"local_admin"')
WHERE email = 'local@venueops.gov';

-- Update district manager
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{role}', '"district_manager"')
WHERE email = 'district@venueops.gov';

-- Update operations user
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{role}', '"operations"')
WHERE email = 'operations@venueops.gov';
```

### **Method 2: Supabase Dashboard (Easiest)**

1. **Go to your Supabase project dashboard**
2. **Navigate to Authentication → Users**
3. **Click on each user** (their email)
4. **Scroll down to "Raw user metadata"** section
5. **Add the role field**:
   ```json
   {"role": "system_admin"}
   ```
6. **Click "Save"**

### **Method 3: Check Current Metadata First**

```sql
-- First, check what metadata exists
SELECT 
  email,
  raw_user_meta_data,
  created_at
FROM auth.users 
WHERE email IN ('admin@venueops.gov', 'local@venueops.gov', 'district@venueops.gov', 'operations@venueops.gov')
ORDER BY created_at;
```

### **🔍 Verification Query**

After updating, verify the metadata:

```sql
-- Check all users with their roles
SELECT 
  email,
  raw_user_meta_data->>'role' as role,
  created_at
FROM auth.users 
ORDER BY created_at;
```

### **📋 Step-by-Step Instructions**

#### **For Supabase Dashboard:**

1. **Login to Supabase Dashboard**
2. **Go to Authentication → Users**
3. **Find user**: Click on email `admin@venueops.gov`
4. **Edit user**: Click the edit/pencil icon
5. **Scroll to "Raw user metadata"**
6. **Add this JSON**:
   ```json
   {"role": "system_admin"}
   ```
7. **Save changes**
8. **Repeat** for each user:
   - `local@venueops.gov` → `{"role": "local_admin"}`
   - `district@venueops.gov` → `{"role": "district_manager"}`
   - `operations@venueops.gov` → `{"role": "operations"}`

#### **For SQL Editor:**

1. **Go to SQL Editor**
2. **Run this query** (one at a time):
   ```sql
   UPDATE auth.users 
   SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{role}', '"system_admin"')
   WHERE email = 'admin@venueops.gov';
   ```
3. **Verify with**:
   ```sql
   SELECT email, raw_user_meta_data->>'role' as role FROM auth.users WHERE email = 'admin@venueops.gov';
   ```

### **⚠️ Important Notes**

1. **Use `raw_user_meta_data`** - This is the actual column name in Supabase
2. **Use `jsonb_set`** - This is the correct JSON function for PostgreSQL
3. **Exact role names** - Must match exactly: `system_admin`, `district_manager`, `local_admin`, `operations`
4. **Test each login** - After updating metadata, test each user login to ensure proper redirection

### **🧪 Testing After Updates**

1. **Clear browser cache** before testing
2. **Login as admin@venueops.gov** → Should redirect to `/dashboard/system-admin`
3. **Login as local@venueops.gov** → Should redirect to `/dashboard/local-admin`
4. **Login as district@venueops.gov** → Should redirect to `/dashboard/district-manager`
5. **Login as operations@venueops.gov** → Should redirect to `/dashboard/operations`

### **🔍 Troubleshooting**

If users still don't redirect correctly:

1. **Check metadata** with verification query
2. **Clear browser cache** and cookies
3. **Logout and login again**
4. **Check browser console** for any errors

The **Supabase Dashboard method** is the safest and most reliable approach!
