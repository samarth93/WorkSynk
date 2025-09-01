#!/usr/bin/env python3
"""
Script to fix existing admin users by setting isGlobalAdmin = true
This fixes the issue where existing users don't have the new global admin field
"""

import pymongo
import os
from datetime import datetime

# MongoDB connection string - update this with your actual connection details
MONGODB_URI = "mongodb+srv://palsamarth9:Arun.1234@cluster0.4yyhdbj.mongodb.net/workspace_db?retryWrites=true&w=majority"

def fix_admin_users():
    try:
        # Connect to MongoDB
        client = pymongo.MongoClient(MONGODB_URI)
        db = client.workspace_db
        users_collection = db.users
        
        print("🔍 Checking current users in database...")
        
        # Find all users
        all_users = list(users_collection.find({}))
        print(f"Found {len(all_users)} users in database")
        
        for user in all_users:
            print(f"\n👤 User: {user.get('email')} ({user.get('firstName', '')} {user.get('lastName', '')})")
            print(f"   - isGlobalAdmin: {user.get('isGlobalAdmin', 'NOT SET')}")
            print(f"   - adminRooms: {len(user.get('adminRooms', []))}")
            print(f"   - workspaceIds: {len(user.get('workspaceIds', []))}")
        
        # Strategy: Set isGlobalAdmin = true for users who created their own workspace
        # These are typically users who have workspaces where they are the admin
        
        workspaces_collection = db.workspaces
        
        print("\n🔧 Fixing admin users...")
        
        # Find all workspaces and their admins
        workspaces = list(workspaces_collection.find({}))
        workspace_admins = set()
        
        for workspace in workspaces:
            admin_id = workspace.get('adminId')
            if admin_id:
                workspace_admins.add(admin_id)
                print(f"   📁 Workspace '{workspace.get('name')}' admin: {admin_id}")
        
        # Update users who are workspace admins
        updated_count = 0
        for admin_id in workspace_admins:
            result = users_collection.update_one(
                {"_id": admin_id},
                {"$set": {"isGlobalAdmin": True}}
            )
            if result.modified_count > 0:
                updated_count += 1
                user = users_collection.find_one({"_id": admin_id})
                print(f"   ✅ Updated {user.get('email')} to global admin")
        
        # Special case: Also make the specific admin email a global admin
        admin_email = "palsamarth9@gmail.com"
        result = users_collection.update_one(
            {"email": admin_email},
            {"$set": {"isGlobalAdmin": True}}
        )
        if result.modified_count > 0:
            print(f"   ✅ Updated {admin_email} to global admin (special case)")
            updated_count += 1
        
        print(f"\n🎉 Successfully updated {updated_count} users to global admin status")
        
        # Show final status
        print("\n📊 Final user status:")
        all_users_updated = list(users_collection.find({}))
        for user in all_users_updated:
            print(f"   👤 {user.get('email')}: isGlobalAdmin = {user.get('isGlobalAdmin', False)}")
        
        client.close()
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    print("🚀 Starting admin users fix script...")
    fix_admin_users()
    print("✅ Script completed!")
