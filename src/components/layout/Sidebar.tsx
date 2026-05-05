import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/atendimentos", label: "Atendimentos" },
  { href: "/clientes", label: "Clientes" },
  { href: "/escala", label: "Escala" },
  { href: "/contratos", label: "Contratos" },
  { href: "/cadastros/motoristas", label: "Motoristas" },
  { href: "/cadastros/veiculos", label: "Veiculos" },
  { href: "/cadastros/parceiros", label: "Parceiros" },
];

export default function Sidebar() {
  return (
    <nav>
      <ul>
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
