"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PresetPicker } from "@/components/PresetPicker";
import { usePresets } from "@/hooks/use-presets";
import { slugify } from "@/lib/slug";
import { createSession } from "@/features/session/actions";

const ERROR_MESSAGE = {
  "nome-invalido": "Esse nome não dá — tenta outro (só letras, números e hífen).",
  "slug-em-uso": "Esse nome já está em uso agora. Tenta outro.",
} as const;

export function CreateSessionForm() {
  const router = useRouter();
  const { presets, addPreset } = usePresets();
  const [isPending, startTransition] = useTransition();
  const [slugInput, setSlugInput] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [host, setHost] = useState("");

  useEffect(() => {
    // Seeding from window.location, unavailable during SSR/prerendering.
    setHost(window.location.host);
  }, []);

  const preview = slugify(slugInput);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createSession({
        slug: slugInput || undefined,
        creatorName: creatorName || undefined,
        focusMinutes,
        breakMinutes,
      });
      if (result.error) {
        setError(ERROR_MESSAGE[result.error]);
        return;
      }
      router.push(`/${result.slug}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="slug">Nome da sessão (opcional)</Label>
        <Input
          id="slug"
          value={slugInput}
          onChange={(e) => setSlugInput(e.target.value)}
          placeholder="co-writing"
          maxLength={32}
        />
        <p className="text-xs text-muted-foreground">
          {host || "syncpair.vercel.app"}/{preview || "—"} · deixa em branco pra gerar aleatório
        </p>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="creatorName">Seu nome (opcional)</Label>
        <Input
          id="creatorName"
          value={creatorName}
          onChange={(e) => setCreatorName(e.target.value)}
          placeholder="i.e.: Gil"
          maxLength={40}
        />
      </div>

      <div className="flex gap-4">
        <PresetPicker
          id="focusMinutes"
          label="Foco (min)"
          value={focusMinutes}
          presets={presets.focus}
          onChange={setFocusMinutes}
          onAdd={(minutes) => addPreset("focus", minutes)}
        />
        <PresetPicker
          id="breakMinutes"
          label="Pausa (min)"
          value={breakMinutes}
          presets={presets.break}
          onChange={setBreakMinutes}
          onAdd={(minutes) => addPreset("break", minutes)}
        />
      </div>

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? "Criando…" : "Criar sessão"}
      </Button>
    </form>
  );
}
