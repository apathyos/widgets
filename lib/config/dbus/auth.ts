import { NM_AGENT_INTERFACE } from '@/constants/auth';

export const POLKIT_AGENT_XML = `
<node>
  <interface name="org.freedesktop.PolicyKit1.AuthenticationAgent">
    <method name="BeginAuthentication">
      <arg name="action_id" type="s" direction="in"/>
      <arg name="message" type="s" direction="in"/>
      <arg name="icon_name" type="s" direction="in"/>
      <arg name="details" type="a{ss}" direction="in"/>
      <arg name="cookie" type="s" direction="in"/>
      <arg name="identities" type="a(sa{sv})" direction="in"/>
    </method>

    <method name="CancelAuthentication">
      <arg name="cookie" type="s" direction="in"/>
    </method>
  </interface>
</node>
`;

export const NM_SECRET_AGENT_XML = `
<node>
  <interface name="${NM_AGENT_INTERFACE}">
    <method name="GetSecrets">
      <arg
        name="connection"
        type="a{sa{sv}}"
        direction="in"
      />
      <arg
        name="connection_path"
        type="o"
        direction="in"
      />
      <arg
        name="setting_name"
        type="s"
        direction="in"
      />
      <arg
        name="hints"
        type="as"
        direction="in"
      />
      <arg
        name="flags"
        type="u"
        direction="in"
      />

      <arg
        name="secrets"
        type="a{sa{sv}}"
        direction="out"
      />
    </method>

    <method name="CancelGetSecrets">
      <arg
        name="connection_path"
        type="o"
        direction="in"
      />
      <arg
        name="setting_name"
        type="s"
        direction="in"
      />
    </method>

    <method name="SaveSecrets">
      <arg
        name="connection"
        type="a{sa{sv}}"
        direction="in"
      />
      <arg
        name="connection_path"
        type="o"
        direction="in"
      />
    </method>

    <method name="DeleteSecrets">
      <arg
        name="connection"
        type="a{sa{sv}}"
        direction="in"
      />
      <arg
        name="connection_path"
        type="o"
        direction="in"
      />
    </method>
  </interface>
</node>
`;
