export function getTopLevel(
  mathSelected,
  scienceSelected,
  sstSelected,
  englishSelected
) {
  if (mathSelected) {
    return "Maths";
  } else if (scienceSelected) {
    return "Science";
  } else if (sstSelected) {
    return "SST";
  } else if (englishSelected) {
    return "English";
  } else {
    return "General";
  }
}
