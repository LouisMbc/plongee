/////////////////////////////////////////////////////////////
//
// pgAdmin 4 - PostgreSQL Tools
//
// Copyright (C) 2013 - 2025, The pgAdmin Development Team
// This software is released under the PostgreSQL Licence
//
//////////////////////////////////////////////////////////////

define('pgadmin.user_management.current_user', [], function() {
    return {
        'id': 1,
        'email': 'admin@plongee.com',
        'is_admin': true,
        'name': 'admin',
        'allow_save_password': true,
        'allow_save_tunnel_password': false,
        'auth_sources': ['internal'],
        'current_auth_source': 'internal',
        'permissions': ['tools_restore', 'tools_erd_tool', 'tools_psql_tool', 'object_register_server', 'storage_add_folder', 'tools_import_export_data', 'change_password', 'tools_schema_diff', 'tools_debugger', 'tools_search_objects', 'tools_maintenance', 'tools_grant_wizard', 'storage_remove_folder', 'tools_query_tool', 'tools_import_export_servers', 'tools_backup', 'list']
    }
});