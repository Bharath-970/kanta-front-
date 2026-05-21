"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>) => (
  <AccordionPrimitive.Item
    className={cn("border-b border-[var(--border)]", className)}
    {...props}
  />
);

const AccordionTrigger = ({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      className={cn(
        "group flex flex-1 items-center justify-between py-5 text-left font-mono text-sm font-semibold tracking-wide text-[var(--text)] transition-colors duration-200 hover:text-[var(--accent)] [&[data-state=open]]:text-[var(--accent)]",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown
        size={14}
        className="shrink-0 text-[var(--text-muted)] transition-transform duration-300 group-data-[state=open]:rotate-180 group-data-[state=open]:text-[var(--accent)]"
      />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
);

const AccordionContent = ({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>) => (
  <AccordionPrimitive.Content
    className={cn(
      "overflow-hidden font-mono text-sm text-[var(--text-muted)] leading-relaxed data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
      className
    )}
    {...props}
  >
    <div className="pb-5 pt-1">{children}</div>
  </AccordionPrimitive.Content>
);

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };

interface AccordionListItem {
  value: string;
  trigger: string;
  content: string;
}

export default function AccordionList({ items }: { items: AccordionListItem[] }) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger>{item.trigger}</AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
