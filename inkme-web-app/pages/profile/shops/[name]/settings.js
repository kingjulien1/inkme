import { CenteredSpinner } from "@/components/CenteredSpinner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { List } from "@/components/List";
import { InviteArtistsToShopModal } from "@/components/modals/InviteArtistsToShopModal";
import { useCollection, useDocument } from "@/firebase/hooks";
import { UPDATE_SHOP } from "@/firebase/mutations";
import { ALL_INVITES, SHOP } from "@/firebase/queries";
import { useErrorToast, useSuccessToast } from "@/hooks/useToast";
import { Button } from "@chakra-ui/button";
import { FormControl, FormHelperText, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputLeftAddon } from "@chakra-ui/input";
import { Divider, Stack } from "@chakra-ui/layout";
import { Switch } from "@chakra-ui/switch";
import { Textarea } from "@chakra-ui/textarea";
import { mapInvites } from "lib/utils/mappers";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { useForm } from "react-hook-form";

export default function ShopSettings() {
  const { name } = useRouter().query;

  const shopRef = useMemo(() => SHOP(name), [name]);
  const [shop] = useDocument(shopRef, "name");

  const invitesRef = useMemo(() => ALL_INVITES(name), [name]);
  const [invites, invitesLoading] = useCollection(invitesRef, "invitee");

  return (
    <DashboardLayout title="Settings 🔧" subtitle={`manage shop preferences for ${name}.`}>
      {shop ? <ShopSettingsForm defaultValues={shop} /> : <CenteredSpinner />}
      <Divider variant="dashed" pb="4" />
      <List title="active invites" data={mapInvites(invites)} isLoading={invitesLoading}></List>
      {!invitesLoading && <InviteArtistsToShopModal shop={name} />}
    </DashboardLayout>
  );
}

function ShopSettingsForm({ defaultValues }) {
  const { register, handleSubmit, formState } = useForm({ defaultValues });
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();

  async function onSubmit(values) {
    try {
      await UPDATE_SHOP(defaultValues.name, values);
      successToast({ description: `successfully updated ${defaultValues.name}.` });
    } catch ({ message }) {
      errorToast({ description: message });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing="12" my="8">
        <FormControl>
          <FormLabel>Address</FormLabel>
          <Input autoCorrect="off" name="address" type="address" ref={register()}></Input>
          <FormHelperText>We recommend providing the full address to your shop, to make it easy for customers to find your shop.</FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel>Bio</FormLabel>
          <Textarea name="bio" ref={register()} placeholder="come here if you want..."></Textarea>
          <FormHelperText>Tell your customers what they can expect at your shop (in terms of style, rules, etc..</FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel>Link Instagram</FormLabel>
          <InputGroup>
            <InputLeftAddon bg="transparent">https://www.instagram.com/</InputLeftAddon>
            <Input name="instagram" ref={register()} placeholder="postmalone"></Input>
          </InputGroup>
          <FormHelperText>
            just copy & paste the link to your public instagram profile in here. We will show your latest posts & a link to your instagram-profile on
            your public profile.
          </FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel>Use Instagram Profile Picture</FormLabel>
          <Switch name="useInstagramProfilePicture" ref={register()} size="lg" colorScheme="teal"></Switch>
          <FormHelperText>use my instagram profile picture also as my ink.me profile picture.</FormHelperText>
        </FormControl>
        <Button type="submit" colorScheme="teal" isLoading={formState.isSubmitting}>
          save
        </Button>
      </Stack>
    </form>
  );
}
