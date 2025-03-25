"use client";

import { DisciplineSwitcherItem } from "@/app/_components/ui";
import { type Discipline } from "@/app/_types";
import { DISCIPLINES } from "@/shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function Disciplines() {
  const [currentDiscipline, setCurrentDiscipline] =
    useState<Discipline>("3by3");
  const router = useRouter();

  return (
    <div className="flex gap-3">
      {DISCIPLINES.map((discipline) => (
        <Link
          href={{ pathname: "/contests", query: { discipline } }}
          onClick={(e) => {
            e.preventDefault();
            setCurrentDiscipline(discipline);
            router.push(`/contests?discipline=${discipline}`);
          }}
          key={discipline}
        >
          <DisciplineSwitcherItem
            asButton={false}
            discipline={discipline}
            isActive={discipline === currentDiscipline}
          />
        </Link>
      ))}
    </div>
  );
}
