import { describe, expect, mock, test } from "bun:test";

const insert = mock(async (_row) => ({ error: null }));
const eq = mock(async (_column, _id) => ({ error: null }));
const update = mock((_row) => ({ eq }));
mock.module("@/integrations/supabase/client", () => ({
  supabase: { from: () => ({ insert, update }) },
}));

const { addMovie, updateMovie, filterMoviesByGenres, genresInUse } = await import("./movies");
const input = {
  title: "Filme teste", director: "Diretor", speakers: "", genres: [],
  year: null, synopsis: "", imageUrl: "", sessionDate: "2026-10-28",
  sessionTime: "18:30", sessionLocation: "Auditório",
};

describe("session exhibition details", () => {
  test("adding a movie saves its exhibition time", async () => {
    await addMovie(input);
    expect(insert.mock.calls.at(-1)?.[0]).toMatchObject({ session_time: "18:30" });
  });
  test("adding a movie saves its exhibition location", async () => {
    await addMovie(input);
    expect(insert.mock.calls.at(-1)?.[0]).toMatchObject({ session_location: "Auditório" });
  });
  test("editing a movie replaces its exhibition time and location", async () => {
    await updateMovie("filme-teste", { ...input, sessionTime: "19:00", sessionLocation: "Sala 2" });
    expect(update.mock.calls.at(-1)?.[0]).toMatchObject({ session_time: "19:00", session_location: "Sala 2" });
    expect(eq.mock.calls.at(-1)).toEqual(["id", "filme-teste"]);
  });
  test("exhibition details can be cleared", async () => {
    await updateMovie("filme-teste", { ...input, sessionTime: "", sessionLocation: " " });
    expect(update.mock.calls.at(-1)?.[0]).toMatchObject({ session_time: null, session_location: null });
  });
});