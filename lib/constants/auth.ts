import { APP_ID } from './os';

export const AUTHORITY_NAME = 'org.freedesktop.PolicyKit1';
export const AUTHORITY_PATH = '/org/freedesktop/PolicyKit1/Authority';
export const AUTHORITY_INTERFACE = 'org.freedesktop.PolicyKit1.Authority';

export const AGENT_PATH = `/org/${APP_ID}/PolicyKit1/AuthenticationAgent`;
export const CANCELLED_ERROR = 'org.freedesktop.PolicyKit1.Error.Cancelled';
export const FAILED_ERROR = 'org.freedesktop.PolicyKit1.Error.Failed';

export const AGENT_XML = `
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
