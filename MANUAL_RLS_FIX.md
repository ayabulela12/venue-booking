# MANUAL RLS POLICY FIX - IMMEDIATE ACTION REQUIRED

## **🚨 CRITICAL ISSUE IDENTIFIED**

The venue deletion is failing because the database RLS policies still only allow the old `'admin'` role, but the new role system uses `'system_admin'` and `'district_manager'`.

## **🔧 IMMEDIATE FIX REQUIRED**

### **Step 1: Go to Supabase Dashboard**
1. Navigate to your Supabase project dashboard
2. Go to **SQL Editor** (in the left sidebar)

### **Step 2: Execute This SQL**

Copy and paste this **exact** SQL into the editor:

```sql
-- Drop old policy that only allows 'admin' role
DROP POLICY IF EXISTS "Admins can manage venues" ON venues;

-- Create new policy for System Admins (includes backward compatibility with 'admin')
CREATE POLICY "System admins can manage venues" ON venues FOR ALL USING (
  auth.jwt() ->> 'role' IN ('system_admin', 'admin')
);

-- Create policy for District Managers
CREATE POLICY "District managers can manage venues" ON venues FOR ALL USING (
  auth.jwt() ->> 'role' = 'district_manager'
);

-- Keep existing read policy for everyone
CREATE POLICY "Venues are viewable by everyone" ON venues FOR SELECT USING (true);
```

### **Step 3: Click Run**
- Click the **Run** button to execute the SQL
- You should see "Success" message if it works

### **Step 4: Verify Fix**
After running the SQL, try deleting a venue again:
1. Go to http://localhost:3001/venues
2. Click on any venue (as System Admin or District Manager)
3. Click the **Delete** button
4. Confirm deletion
5. Should work without permission error

## **🔍 Why This is Happening**

- ✅ **UI Fixed**: Delete button shows for correct roles
- ❌ **Database Not Fixed**: RLS policies still block deletion
- 🎯 **Root Cause**: Database permissions haven't been updated yet

## **⚡ Quick Alternative**

If you can't access Supabase dashboard, you can also:

1. **Use Supabase CLI** (if installed)
2. **Contact database administrator** to run the SQL
3. **Use the safe script** we created earlier

## **🎯 Expected Result**

After the RLS fix:
- ✅ System Admin can delete any venue
- ✅ District Manager can delete venues
- ✅ No more "permission denied" errors
- ✅ Deletion works from UI

**The UI fixes are complete and working - we just need to update the database RLS policies!**
