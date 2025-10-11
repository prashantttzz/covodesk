import { OrganizationList } from "@clerk/nextjs"

const page = () => {
  return (
  <OrganizationList
        afterCreateOrganizationUrl={"/"}
        afterSelectOrganizationUrl={"/"}
        hidePersonal
        skipInvitationScreen
      />      )
}

export default page