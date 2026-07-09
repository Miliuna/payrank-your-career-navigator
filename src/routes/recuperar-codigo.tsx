import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { reenviarCodigoAcceso } from "@/lib/diagnostico/diagnostico.functions";
import { useLang } from "@/lib/lang";

export const Route = createFileRoute("/recuperar-codigo")({
  head: () => ({ meta: [{ title: "Recuperar código — PayRank" }] }),
  component: RecuperarCodigoPage,
});

function RecuperarCodigoPage() {
  const { lang } = useLang();
  const isEN = lang === "EN";
  const enviar = useServerFn(reenviarCodigoAcceso);

  const [email, setEmail] = React.useState("");
  const [estado, setEstado] = React.useState<"idle" | "busy" | "enviado">("idle");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setEstado("busy");
    try {
      await enviar({ data: { email: email.trim() } });
    } catch {
      // No mostramos error técnico — el mensaje final es siempre el mismo.
    } finally {
      setEstado("enviado");
    }
  };

  return (
    


      


        


          
            PayRank
          


        


        
          


            


              
                {isEN ? "Recover your code" : "Recuperar tu código"}
              


              
                {isEN
                  ? "If your email has active PayRank codes, we'll send them to you."
                  : "Si tu mail tiene códigos PayRank activos, te los reenviamos."}
              


            

            {estado !== "enviado" ? (
              


                
                  {isEN ? "YOUR EMAIL" : "TU MAIL"}
                
                


                   setEmail(e.target.value)}
                    placeholder={isEN ? "you@email.com" : "vos@mail.com"}
                    className="flex-1 bg-hueso/5 border border-hueso/20 px-3 py-2 font-body text-sm text-hueso placeholder:text-hueso/40 focus:outline-none focus:border-hueso/60"
                  />
                  
                    {estado === "busy" ? "…" : (isEN ? "SEND" : "ENVIAR")}
                  
                
              
            ) : (
              


                
                  {isEN
                    ? "If that email has active codes, check your inbox in a few minutes."
                    : "Si ese mail tiene códigos activos, revisá tu casilla en unos minutos."}
                
              


            )}
          
        
      
    
  );
}
