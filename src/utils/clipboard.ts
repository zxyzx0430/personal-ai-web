export async function copyText(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; }
  catch {
    try {
      const input=document.createElement('textarea');input.value=text;input.style.position='fixed';input.style.left='-9999px';document.body.append(input);
      input.select();const copied=document.execCommand('copy');input.remove();return copied;
    } catch { return false; }
  }
}
