import { useState, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleCardProps {
  /** Conteúdo sempre visível na linha do header (sem o chevron — ele é adicionado automaticamente) */
  header: ReactNode;
  /** Conteúdo que aparece/desaparece com animação */
  children: ReactNode;
  /** Classes extras para o wrapper raiz */
  className?: string;
  /** Classes extras para o container do body expandido */
  bodyClassName?: string;
}

/**
 * Card colapsável com animação suave usando a técnica de grid-template-rows.
 * Não inclui estilos de card — a aparência visual (border, bg, rounded) deve
 * ser aplicada pelo elemento pai ou via `className`.
 */
export function CollapsibleCard({
  header,
  children,
  className,
  bodyClassName,
}: CollapsibleCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <div className={className}>
      {/* Header clicável */}
      <div
        role="button"
        tabIndex={0}
        className="flex items-center gap-3 px-3 py-3 cursor-pointer select-none"
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">{header}</div>
        <ChevronDown
          size={16}
          className={cn(
            "shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </div>

      {/* Body com animação grid-template-rows: 0fr → 1fr */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-in-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className={cn("border-t border-border/50 px-3 pb-3", bodyClassName)}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
