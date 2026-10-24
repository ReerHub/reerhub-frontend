import Image from "next/image";
import Link from "next/link";
export default function Brand() {
  return (
    <Link
      href="/resume"
      className="brand"
      aria-label="REERHUB Resume Builder home"
    >
      <Image src="/reerhub-icon-logo.png" alt="" width={32} height={32} />
      <span>
        <strong>REERHUB</strong>
        <small>RESUME BUILDER</small>
      </span>
    </Link>
  );
}
