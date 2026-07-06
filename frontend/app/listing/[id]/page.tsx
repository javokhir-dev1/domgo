import ListingClient from "./client";

export default function ListingPage({ params }: { params: { id: string } }) {
  return <ListingClient id={params.id} />;
}
