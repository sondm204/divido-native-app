export async function fetchGroups() {
    const res = await fetch("https://divido-be.onrender.com/groups");
    if (!res.ok) throw new Error("Failed to fetch groups");
    return res.json();
  }
  
  export async function createGroup(body: { name: string; desc?: string }) {
    const res = await fetch("https://divido-be.onrender.com/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Failed to create group");
    return res.json();
  }
  