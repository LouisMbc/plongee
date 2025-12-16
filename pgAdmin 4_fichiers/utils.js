/////////////////////////////////////////////////////////////
//
// pgAdmin 4 - PostgreSQL Tools
//
// Copyright (C) 2013 - 2025, The pgAdmin Development Team
// This software is released under the PostgreSQL Licence
//
//////////////////////////////////////////////////////////////



define('pgadmin.browser.utils',
  ['sources/pgadmin'], function(pgAdmin) {
  let pgBrowser = pgAdmin.Browser = pgAdmin.Browser || {};

  pgBrowser['MainMenus'] = [];

  pgAdmin['csrf_token_header'] = 'X-pgA-CSRFToken';
  pgAdmin['csrf_token'] = 'Ijk1MGU2Y2RjYTJlZDg3OWU5ZTdiMTA4YTFmNDkwYzFiZDQ5MWZmOWIi.aUE3Lw.rzoZYURKsHKecULNvOCR5aGW3WA';
  pgAdmin['server_mode'] = 'True';

  /* Get the inactivity related config */
  pgAdmin['user_inactivity_timeout'] = 0;
  pgAdmin['override_user_inactivity_timeout'] = 'True' == 'True';

  /* GET PSQL Tool related config */
  pgAdmin['enable_psql'] =  'False' == 'True';
  pgAdmin['shared_storage'] = []
  pgAdmin['restricted_shared_storage'] = []
  pgAdmin['platform'] =  'linux';
  pgAdmin['qt_default_placeholder'] = '%DATABASE%/%USERNAME%@%SERVER%'
  pgAdmin['vw_edt_default_placeholder'] = '%SCHEMA%.%TABLE%/%DATABASE%/%USERNAME%@%SERVER%'

  /* GET Binary Path Browse config */
  pgAdmin['enable_binary_path_browsing'] = 'False' == 'True';

  pgAdmin['fixed_binary_paths'] = {'pg': '', 'pg-13': '', 'pg-14': '', 'pg-15': '', 'pg-16': '', 'pg-17': '', 'pg-18': '', 'ppas': '', 'ppas-13': '', 'ppas-14': '', 'ppas-15': '', 'ppas-16': '', 'ppas-17': '', 'ppas-18': ''};

   /* Server Heartbeat Timeout */
  pgAdmin['heartbeat_timeout'] =  '30';

  /* Minimum password length */
  pgAdmin['password_length_min'] = '6';

  /* Enable server password exec command */
  pgAdmin['enable_server_passexec_cmd'] = 'False';

  // Define list of nodes on which Query tool option doesn't appears
  let unsupported_nodes = pgAdmin.unsupported_nodes = [
     'server_group', 'server', 'coll-tablespace', 'tablespace',
     'coll-role', 'role', 'coll-resource_group', 'resource_group',
     'coll-database', 'coll-pga_job', 'coll-pga_schedule', 'coll-pga_jobstep',
     'pga_job', 'pga_schedule', 'pga_jobstep',
     'coll-replica_node', 'replica_node','coll-directory','directory'
  ];

  pgBrowser.utils = {
    layout: {"Browser/Layout": "{\"dockbox\":{\"id\":\"+2\",\"size\":200,\"mode\":\"horizontal\",\"children\":[{\"id\":\"+3\",\"size\":20,\"tabs\":[{\"id\":\"id-object-explorer\"}],\"group\":\"object-explorer\",\"activeId\":\"id-object-explorer\"},{\"id\":\"id-main\",\"size\":80,\"tabs\":[{\"id\":\"id-dashboard\"},{\"id\":\"id-properties\"},{\"id\":\"id-sql\"},{\"id\":\"id-statistics\"},{\"id\":\"id-dependencies\"},{\"id\":\"id-dependents\"},{\"id\":\"id-processes\"},{\"id\":\"id-query-tool_1374723\",\"metaData\":{\"toolUrl\":\"/sqleditor/panel/1374723?is_query_tool=true\u0026sgid=1\u0026sid=4\u0026did=16384\u0026database_name=plongee_db\",\"formParams\":{\"query_url\":\"\",\"title\":\"plongee_db/plongee_user@plongee-postgres\",\"selectedNodeInfo\":\"{\\\"database\\\":{\\\"id\\\":\\\"database_16384\\\",\\\"label\\\":\\\"plongee_db\\\",\\\"icon\\\":\\\"pg-icon-database\\\",\\\"inode\\\":true,\\\"_type\\\":\\\"database\\\",\\\"_id\\\":16384,\\\"_pid\\\":4,\\\"module\\\":\\\"pgadmin.node.database\\\",\\\"connected\\\":true,\\\"tablespace\\\":\\\"pg_default\\\",\\\"allowConn\\\":true,\\\"canCreate\\\":true,\\\"canDisconn\\\":false,\\\"canDrop\\\":false,\\\"isTemplate\\\":false,\\\"description\\\":null,\\\"type\\\":2,\\\"_label\\\":\\\"plongee_db\\\",\\\"is_collection\\\":false,\\\"priority\\\":0},\\\"server\\\":{\\\"id\\\":\\\"server_4\\\",\\\"label\\\":\\\"plongee-postgres\\\",\\\"icon\\\":\\\"icon-pg\\\",\\\"inode\\\":true,\\\"_type\\\":\\\"server\\\",\\\"_id\\\":\\\"4\\\",\\\"_pid\\\":1,\\\"module\\\":\\\"pgadmin.node.server\\\",\\\"connected\\\":true,\\\"server_type\\\":\\\"pg\\\",\\\"version\\\":150014,\\\"db\\\":\\\"plongee_db\\\",\\\"user\\\":{\\\"id\\\":10,\\\"name\\\":\\\"plongee_user\\\",\\\"is_superuser\\\":true,\\\"can_create_role\\\":true,\\\"can_create_db\\\":true,\\\"can_signal_backend\\\":false},\\\"in_recovery\\\":false,\\\"wal_pause\\\":false,\\\"host\\\":\\\"postgres\\\",\\\"port\\\":5432,\\\"is_password_saved\\\":true,\\\"is_tunnel_password_saved\\\":false,\\\"was_connected\\\":false,\\\"errmsg\\\":null,\\\"user_id\\\":1,\\\"username\\\":\\\"plongee_user\\\",\\\"shared\\\":null,\\\"is_kerberos_conn\\\":false,\\\"gss_authenticated\\\":false,\\\"cloud_status\\\":0,\\\"description\\\":null,\\\"tags\\\":[],\\\"type\\\":\\\"pg\\\",\\\"_label\\\":\\\"plongee-postgres\\\",\\\"is_collection\\\":false,\\\"is_connecting\\\":false,\\\"sid\\\":4,\\\"did\\\":16384,\\\"replication_type\\\":null,\\\"priority\\\":-1},\\\"server_group\\\":{\\\"id\\\":\\\"server_group_1\\\",\\\"label\\\":\\\"Servers\\\",\\\"icon\\\":\\\"icon-server_group\\\",\\\"inode\\\":true,\\\"_type\\\":\\\"server_group\\\",\\\"_id\\\":\\\"1\\\",\\\"_pid\\\":null,\\\"module\\\":\\\"pgadmin.node.server_group\\\",\\\"can_delete\\\":false,\\\"user_id\\\":1,\\\"is_shared\\\":false,\\\"type\\\":2,\\\"_label\\\":\\\"Servers\\\",\\\"is_collection\\\":true,\\\"priority\\\":-2}}\"},\"tabParams\":{\"title\":\"plongee_db/plongee_user@plongee-postgres\",\"icon\":\"pg-font-icon icon-query_tool\",\"tooltip\":\"\u00c9diteur de requ\u00eate - plongee_db/plongee_user@plongee-postgres\",\"renamable\":true,\"cached\":true,\"internal\":{\"icon\":\"pg-font-icon icon-query_tool\",\"title\":\"plongee_db/plongee_user@plongee-postgres*\",\"tooltip\":\"\u00c9diteur de requ\u00eate - plongee_db/plongee_user@plongee-postgres*\",\"closable\":true,\"renamable\":true,\"manualClose\":true,\"isDirty\":true,\"fileName\":null},\"workSpace\":\"default_workspace\"},\"restore\":true}},{\"id\":\"id-query-tool_6203778\",\"metaData\":{\"toolUrl\":\"/sqleditor/panel/6203778?is_query_tool=true\u0026sgid=1\u0026sid=4\u0026did=16384\u0026database_name=plongee_db\",\"formParams\":{\"query_url\":\"\",\"title\":\"plongee_db/plongee_user@plongee-postgres\",\"selectedNodeInfo\":\"{\\\"table\\\":{\\\"id\\\":\\\"table_16465\\\",\\\"label\\\":\\\"Role\\\",\\\"icon\\\":\\\"icon-table\\\",\\\"inode\\\":true,\\\"_type\\\":\\\"table\\\",\\\"_id\\\":16465,\\\"_pid\\\":16448,\\\"module\\\":\\\"pgadmin.node.table\\\",\\\"tigger_count\\\":\\\"0\\\",\\\"has_enable_triggers\\\":\\\"0\\\",\\\"is_partitioned\\\":false,\\\"description\\\":null,\\\"type\\\":2,\\\"_label\\\":\\\"Role\\\",\\\"is_collection\\\":false,\\\"priority\\\":0},\\\"schema\\\":{\\\"id\\\":\\\"schema_16448\\\",\\\"label\\\":\\\"public\\\",\\\"icon\\\":\\\"icon-schema\\\",\\\"inode\\\":true,\\\"_type\\\":\\\"schema\\\",\\\"_id\\\":16448,\\\"_pid\\\":16384,\\\"module\\\":\\\"pgadmin.node.schema\\\",\\\"can_create\\\":true,\\\"has_usage\\\":true,\\\"description\\\":null,\\\"type\\\":2,\\\"_label\\\":\\\"public\\\",\\\"is_collection\\\":false,\\\"priority\\\":-1},\\\"database\\\":{\\\"id\\\":\\\"database_16384\\\",\\\"label\\\":\\\"plongee_db\\\",\\\"icon\\\":\\\"pg-icon-database\\\",\\\"inode\\\":true,\\\"_type\\\":\\\"database\\\",\\\"_id\\\":16384,\\\"_pid\\\":4,\\\"module\\\":\\\"pgadmin.node.database\\\",\\\"connected\\\":true,\\\"tablespace\\\":\\\"pg_default\\\",\\\"allowConn\\\":true,\\\"canCreate\\\":true,\\\"canDisconn\\\":false,\\\"canDrop\\\":false,\\\"isTemplate\\\":false,\\\"description\\\":null,\\\"type\\\":2,\\\"_label\\\":\\\"plongee_db\\\",\\\"is_collection\\\":false,\\\"priority\\\":-2},\\\"server\\\":{\\\"id\\\":\\\"server_4\\\",\\\"label\\\":\\\"plongee-postgres\\\",\\\"icon\\\":\\\"icon-pg\\\",\\\"inode\\\":true,\\\"_type\\\":\\\"server\\\",\\\"_id\\\":\\\"4\\\",\\\"_pid\\\":1,\\\"module\\\":\\\"pgadmin.node.server\\\",\\\"connected\\\":true,\\\"server_type\\\":\\\"pg\\\",\\\"version\\\":150014,\\\"db\\\":\\\"plongee_db\\\",\\\"user\\\":{\\\"id\\\":10,\\\"name\\\":\\\"plongee_user\\\",\\\"is_superuser\\\":true,\\\"can_create_role\\\":true,\\\"can_create_db\\\":true,\\\"can_signal_backend\\\":false},\\\"in_recovery\\\":false,\\\"wal_pause\\\":false,\\\"host\\\":\\\"postgres\\\",\\\"port\\\":5432,\\\"is_password_saved\\\":true,\\\"is_tunnel_password_saved\\\":false,\\\"was_connected\\\":false,\\\"errmsg\\\":null,\\\"user_id\\\":1,\\\"username\\\":\\\"plongee_user\\\",\\\"shared\\\":null,\\\"is_kerberos_conn\\\":false,\\\"gss_authenticated\\\":false,\\\"cloud_status\\\":0,\\\"description\\\":null,\\\"tags\\\":[],\\\"type\\\":\\\"pg\\\",\\\"_label\\\":\\\"plongee-postgres\\\",\\\"is_collection\\\":false,\\\"is_connecting\\\":false,\\\"sid\\\":4,\\\"did\\\":16384,\\\"replication_type\\\":null,\\\"priority\\\":-3},\\\"server_group\\\":{\\\"id\\\":\\\"server_group_1\\\",\\\"label\\\":\\\"Servers\\\",\\\"icon\\\":\\\"icon-server_group\\\",\\\"inode\\\":true,\\\"_type\\\":\\\"server_group\\\",\\\"_id\\\":\\\"1\\\",\\\"_pid\\\":null,\\\"module\\\":\\\"pgadmin.node.server_group\\\",\\\"can_delete\\\":false,\\\"user_id\\\":1,\\\"is_shared\\\":false,\\\"type\\\":2,\\\"_label\\\":\\\"Servers\\\",\\\"is_collection\\\":true,\\\"priority\\\":-4}}\"},\"tabParams\":{\"title\":\"plongee_db/plongee_user@plongee-postgres\",\"icon\":\"pg-font-icon icon-query_tool\",\"tooltip\":\"\u00c9diteur de requ\u00eate - plongee_db/plongee_user@plongee-postgres\",\"renamable\":true,\"cached\":true,\"internal\":{\"icon\":\"pg-font-icon icon-query_tool\",\"title\":\"plongee_db/plongee_user@plongee-postgres*\",\"tooltip\":\"\u00c9diteur de requ\u00eate - plongee_db/plongee_user@plongee-postgres*\",\"closable\":true,\"renamable\":true,\"manualClose\":true,\"isDirty\":true,\"fileName\":null},\"workSpace\":\"default_workspace\"},\"restore\":true}}],\"group\":\"playground\",\"activeId\":\"id-query-tool_6203778\",\"panelLock\":{\"panelStyle\":\"playground\"}}]},\"floatbox\":{\"id\":\"+22\",\"size\":0,\"mode\":\"float\",\"children\":[]},\"windowbox\":{\"id\":\"+23\",\"size\":0,\"mode\":\"window\",\"children\":[]},\"maxbox\":{\"id\":\"+24\",\"size\":1,\"mode\":\"maximize\",\"children\":[]}}"},
    theme: '',
    pg_help_path: 'https://www.postgresql.org/docs/$VERSION$/',
    app_name: 'pgAdmin 4',
    app_version_int: '90800',
    pg_libpq_version: 0,
    support_ssh_tunnel: 'True' == 'True',
    logout_url: '/logout?next=/browser/',
    max_server_tags_allowed: 5,

    counter: {total: 0, loaded: 0},
    registerScripts: function (ctx) {
      // There are some scripts which needed to be loaded immediately,
      // but - not all. We will will need to generate all the menus only
      // after they all were loaded completely.
    },

    addBackendMenus: function (obj) {
      // Generate the menu items only when all the initial scripts
      // were loaded completely.
      //
      // First - register the menus from the other
      // modules/extensions.
            obj.add_menus([
      {
  name: "mnu_resetlayout",
  module: pgAdmin.Settings,
  callback: "show",
  label: "Réinitialiser l'affichage", applies: ["file"],
  priority: 997,
  enable: "",
      }]);
            obj.add_menus([
  ]);
            obj.add_menus([
  ]);
            obj.add_menus([
  ]);
            obj.add_menus([
      {
  name: "mnu_quick_search_help",
  url: "#",
  target: "pgadmin_quick_search_help",
  icon: "fa fa-question",
  label: "Recherche rapide", applies: ["help"],
  priority: 99,
  enable: "",
      },     {
  name: "mnu_online_help",
  url: "/help/help/index.html?ver=90800",
  target: "pgadmin_help",
  icon: "fa fa-question",
  label: "Aide en ligne", applies: ["help"],
  priority: 100,
  enable: "",
      },     {
  name: "mnu_pgadmin_website",
  url: "https://www.pgadmin.org/",
  target: "pgadmin_website",
  icon: "fa fa-external-link-alt",
  label: "Site pgAdmin", applies: ["help"],
  priority: 200,
  enable: "",
      },     {
  name: "mnu_postgresql_website",
  url: "https://www.postgresql.org/",
  target: "postgres_website",
  icon: "fa fa-external-link-alt",
  label: "Site PostgreSQL", applies: ["help"],
  priority: 300,
  enable: "",
      },     {
  name: "mnu_about",
  module: pgAdmin.About,
  callback: "about_show",
  icon: "fa fa-info-circle",
  label: "A propos de pgAdmin 4", applies: ["help"],
  priority: 999,
  enable: "",
      }]);
          },

        userMenuInfo: {
      username: 'admin@plongee.com',
      auth_source: 'interne',
      gravatar: 'https://www.gravatar.com/avatar/dd6428760082a570dc1efd5c7a40b4b8?size=100&default=retro&rating=g',
      menus: [
                {
          label: 'Modifier le mot de passe',
          type: 'normal',
          callback: ()=>{
            pgAdmin.UserManagement.change_password(
              '/browser/change_password'
            )
          }
        },
        {
          type: 'separator',
        },
                        {
          label: 'Two-Factor Authentication',
          type: 'normal',
          callback: ()=>{
            pgAdmin.UserManagement.show_mfa(
              '/mfa/register?next=internal'
            )
          }
        },
        {
          type: 'separator',
        },
                        {
          label: 'Gestion des utilisateurs',
          type: 'normal',
          callback: ()=>{
            pgAdmin.UserManagement.launchUserManagement()
          }
        },
        {
          type: 'separator',
        },
                {
          label: 'Déconnexion',
          type: 'normal',
          callback: ()=>{
            window.location="/logout?next=/browser/";
          }
        },
      ],
    },
      };
  return pgBrowser;
});