import { SignIn, SignInButton } from "@clerk/nextjs"

const page = () => {
  return (
    <div><SignIn routing="hash"/></div>
  )
}

export default page