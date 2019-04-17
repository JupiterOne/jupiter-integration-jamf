import { User } from "../jamf";
import { USER_ENTITY_CLASS, USER_ENTITY_TYPE, UserEntity } from "../jupiterone";

import generateKey from "../utils/generateKey";

export function createUserEntities(data: User[]): UserEntity[] {
  return data.map(user => {
    return {
      _key: generateKey(USER_ENTITY_TYPE, user.id),
      _type: USER_ENTITY_TYPE,
      _class: USER_ENTITY_CLASS,
      id: user.id,
      username: user.name,
      fullName: user.full_name,
      email: user.email,
      emailAddress: user.email_address,
      phoneNumber: user.phone_number,
      position: user.position,
      enableCustomPhotoUrl: user.enable_custom_photo_url,
      customPhotoUrl: user.custom_photo_url,
      ldapServer: user.ldap_server && user.ldap_server.name,
      computer: user.links && JSON.stringify(user.links.computers.computer),
      mobileDevice:
        user.links && JSON.stringify(user.links.mobile_devices.mobile_device),
      peripheral:
        user.links && JSON.stringify(user.links.peripherals.peripheral),
      totalVppCodeCount: user.links && user.links.total_vpp_code_count,
      vppAssignment:
        user.links && JSON.stringify(user.links.vpp_assignments.vpp_assignment),
    };
  });
}
