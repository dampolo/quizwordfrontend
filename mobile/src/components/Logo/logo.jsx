import Artwork from "../../../assets/icons/logo.svg";

export default function Logo({ size = 56 }) {
  return <Artwork width={size} height={size} aria-hidden />;
}
