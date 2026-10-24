// export { default } from '../website/Website';

import { Redirect} from "expo-router"

export default function Index(){
    return <Redirect href="/quiz/(auth)/login-quiz"/>
}