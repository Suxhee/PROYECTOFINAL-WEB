import {
  FormGroup,
  Input,
  Label,
  FormFeedback
} from 'reactstrap';

export default function FormField({
  id,
  label,
  type = 'text',
  error,
  invalid = false,
  ...props
}) {
  return (
    <FormGroup>
      <Label for={id}>
        {label}
      </Label>

      <Input
        {...props}
        id={id}
        type={type}
        invalid={Boolean(error) || invalid}
      />

      {error && (
        <FormFeedback>
          {error}
        </FormFeedback>
      )}
    </FormGroup>
  );
}