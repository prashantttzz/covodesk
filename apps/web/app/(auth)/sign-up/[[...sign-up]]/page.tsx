import { SignUp } from "@clerk/nextjs"

const page = () => {
  return (
    <div><SignUp routing="hash"/></div>
  )
}

export default page