import { redirect } from "next/navigation";

export const metadata = {
  title: "Politica de privacidade | LM Prime System",
};

export default function PoliticaDePrivacidadePage() {
  redirect("/termos-politicas-seguranca");
}
